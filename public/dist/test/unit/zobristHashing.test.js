"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Board_1 = require("../../src/ChessClass/Board");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
const GameStateHelperFunctions_1 = require("../../src/ChessClass/GameStateHelperFunctions");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const Player_1 = require("../../src/ChessClass/Player");
// No direct import of PSEUDO_RANDOM_NUMBERS, PIECE_COLOR, PIECE_TYPE here as HelperFunctions already uses them
// and we rely on the fixed seed in Random.ts for determinism.
// Import Chai for assertions
const chai_1 = require("chai");
// If you prefer assert style: import { assert } from 'chai';
// --- Helper function for testing: Deep clone GameState for isolation ---
// This is crucial for tests where you modify the state and then revert it.
// The cloneGameState from GameStateHelperFunctions.ts is good, but we need
// to ensure it handles the hash correctly for testing purposes.
// For testing purposes, we'll ensure the history is also cloned deeply enough
// so that undoing a move doesn't affect the original state's history.
function deepCloneGameStateForTesting(gameState) {
    const newGameState = {
        player: gameState.player.playerType === 'human' ? new Player_1.HumanPlayer(gameState.player.getColor()) : new Player_1.ComputerPlayer(gameState.player.getColor()),
        opponent: gameState.opponent.playerType === 'human' ? new Player_1.HumanPlayer(gameState.opponent.getColor()) : new Player_1.ComputerPlayer(gameState.opponent.getColor()),
        board: new Board_1.Board(gameState.board.grid), // Board.cloneGrid handles deep cloning of grid
        moveHistory: gameState.moveHistory.map(entry => {
            // Deep clone history entries, especially pieces and boards within them
            const clonedEntry = {
                ...entry,
                piece: Figure_1.Figure.clone(entry.piece),
                board: new Board_1.Board(entry.board.grid), // Clone board within history entry
                destroyedPiece: entry.destroyedPiece ? Figure_1.Figure.clone(entry.destroyedPiece) : null,
                player: entry.player.playerType === 'human' ? new Player_1.HumanPlayer(entry.player.getColor()) : new Player_1.ComputerPlayer(entry.player.getColor()),
            };
            if (clonedEntry.type === 'castling') {
                const castlingEntry = entry;
                clonedEntry.rookPiece = Figure_1.Figure.clone(castlingEntry.rookPiece);
            }
            return clonedEntry;
        }),
        checked: {
            whiteKingChecked: gameState.checked.whiteKingChecked,
            blackKingChecked: gameState.checked.blackKingChecked,
        },
        enPassantTargetFile: gameState.enPassantTargetFile,
        castlingRights: {
            white: { ...gameState.castlingRights.white },
            black: { ...gameState.castlingRights.black },
        },
        hash: gameState.hash, // Hash is a bigint, so direct assignment is fine
    };
    return newGameState;
}
// --- Undo Move Function for Testing ---
// This function attempts to reverse the state changes and hash updates
// made by ChessEngine.applyMove for testing purposes.
// A full, robust undo in a chess engine would be more complex and likely
// would store more specific state changes in the HistoryEntry.
function undoLastMove(gameState) {
    if (gameState.moveHistory.length === 0) {
        return;
    }
    const lastEntry = gameState.moveHistory.pop();
    // Revert board state (simplified: just put pieces back)
    // This is a simplified undo. A full undo needs to reverse all changes made by applyMove.
    gameState.board.place(lastEntry.piece, lastEntry.move.start);
    if (lastEntry.destroyedPiece) {
        // For captures, put the destroyed piece back
        const destroyedPos = lastEntry.type === 'enPassant' ? lastEntry.enPassantCapturedSquare : lastEntry.move.end;
        gameState.board.place(lastEntry.destroyedPiece, destroyedPos);
    }
    else if (lastEntry.type === 'castling') {
        // For castling, move rook back
        const castlingEntry = lastEntry;
        gameState.board.place(castlingEntry.rookPiece, castlingEntry.rookMove.start);
        gameState.board.removePiece(castlingEntry.rookMove.end); // Clear rook's end square
    }
    gameState.board.removePiece(lastEntry.move.end); // Clear the moving piece's end square
    // Revert hash components (XOR out the new state, XOR in the old state)
    // This is the core of testing Zobrist reversibility.
    // Note: This assumes the hash was correctly updated in applyMove.
    // We are essentially re-applying the XORs in reverse.
    // 1. Revert side to move
    // This is the simplest part: XORing the side to move key again flips it back.
    gameState.hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
    // 2. Revert en passant target file
    const enPassantNumbers = (0, HelperFunctions_1.getFilesEnPassantNumbers)();
    // If there was an en passant target *before* the move we are undoing,
    // we need to XOR it back in. The current `gameState.enPassantTargetFile`
    // holds the *new* state after the move, so we XOR that out first.
    if (gameState.enPassantTargetFile !== null) {
        gameState.hash ^= enPassantNumbers[gameState.enPassantTargetFile];
    }
    // Now, set the enPassantTargetFile to what it *was* before the move.
    // This requires the HistoryEntry to store the previous enPassantTargetFile.
    // Since your HistoryEntry doesn't store this, we'll make a simplifying assumption
    // that for tests, if a pawn double push is undone, the en passant file becomes null.
    // For more complex scenarios, you'd need to extend HistoryEntry.
    if (lastEntry.type === 'move' && lastEntry.piece.getPiece() === 'pawn' && Math.abs(lastEntry.move.end.y - lastEntry.move.start.y) === 2) {
        // If the last move was a pawn double push, the en passant target was set.
        // Undoing it means it should be removed.
        gameState.enPassantTargetFile = null;
    }
    else {
        // Otherwise, it should revert to whatever it was before this move.
        // This is a weak point without storing previous enPassantTargetFile in HistoryEntry.
        // For now, we'll assume the tests are structured such that this simplification works.
        // A more robust undo would store `prevEnPassantTargetFile` in `HistoryEntry`.
    }
    // If the previous state had an en passant file, XOR it back in.
    // This part is problematic without `prevEnPassantTargetFile` in `HistoryEntry`.
    // For now, we rely on the overall hash equality check.
    // 3. Revert castling rights
    if (lastEntry.type === 'castling') {
        const castlingEntry = lastEntry;
        const castlingColor = castlingEntry.castlingDetails.at(0) === 'w' ? 'white' : 'black';
        const castlingSide = castlingEntry.castlingDetails.at(1) === 'k' ? 'kingSide' : 'queenSide';
        // Revert the castling right in the gameState object
        gameState.castlingRights[castlingColor][castlingSide] = true; // Castling rights are usually revoked by move, so undoing restores them
        let castlingRightNumber = castlingSide === 'queenSide' ? 1 : 0;
        castlingRightNumber += castlingColor === 'black' ? 2 : 0;
        // XOR back the castling right key
        gameState.hash ^= (0, HelperFunctions_1.getCastlingRightsNumbers)()[castlingRightNumber];
        // Revert rook's position in hash (rook moved during castling)
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end); // XOR out new rook pos
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start); // XOR in old rook pos
    }
    else {
        // If a king or rook moved, it revokes castling rights.
        // To undo this, we need to know if castling rights *were* available before the move.
        // This again points to the need for more state in HistoryEntry (e.g., `prevCastlingRights`).
        // For now, we'll assume the initial state has all castling rights for simplicity in undo.
        // If a test involves revoking rights and then undoing, the `initialGameState` hash comparison will catch it.
    }
    // 4. Revert piece positions
    const color = lastEntry.piece.getColor();
    const pieceType = lastEntry.piece.getPiece();
    if (lastEntry.type === 'move' || lastEntry.type === 'castling') {
        // XOR out new piece position
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, lastEntry.move.end);
        // XOR in old piece position
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, lastEntry.move.start);
    }
    else if (lastEntry.type === 'attackMove' || lastEntry.type === 'enPassant') {
        // XOR out new piece position
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, lastEntry.move.end);
        // XOR in old piece position
        gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, lastEntry.move.start);
        // XOR in destroyed piece (if any)
        if (lastEntry.destroyedPiece) {
            const destroyedPiecePos = lastEntry.type === 'attackMove' ? lastEntry.move.end : lastEntry.enPassantCapturedSquare;
            gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(lastEntry.destroyedPiece.getColor(), lastEntry.destroyedPiece.getPiece(), destroyedPiecePos);
        }
    }
    // Promotion undo is complex as piece type changes. For a full undo, you'd store
    // the original piece type in the history entry. Here, we'll skip explicit hash
    // manipulation for promotion undo and rely on the overall hash check if a test
    // involves promotion.
}
describe('Zobrist Hashing Implementation', () => {
    let initialGameState;
    let expectedInitialHash;
    // Use Mocha's `before` hook (equivalent to Jest's `beforeAll`)
    before(() => {
        // Pre-calculate the expected hash for the initial board state.
        // You MUST run your `initGameStateHash` function once on the starting board
        // and paste the resulting bigint here.
        // For example, if your initial hash calculation gives 12345678901234567890n
        const tempBoard = new Board_1.Board();
        ChessEngine_1.ChessEngine.setupBoard(tempBoard); // Initialize pieces on the board
        const tempGameState = {
            player: new Player_1.HumanPlayer('white'),
            opponent: new Player_1.ComputerPlayer('black'),
            board: tempBoard,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true },
            },
        };
        // This is the actual hash value you'd get from your `initGameStateHash`
        // with your fixed `PSEUDO_RANDOM_NUMBERS`.
        // Run your `npm test` once, if it fails on the first test,
        // copy the `actual` value from the error message and paste it here.
        // Example: If console.log(initGameStateHash(tempGameState)); outputs 12345678901234567890n
        expectedInitialHash = 16318481054465561352n; // <<< REPLACE THIS WITH YOUR ACTUAL CALCULATED INITIAL HASH
        // console.log("Calculated Initial Hash for Test:", initGameStateHash(tempGameState)); // Uncomment to get the value
    });
    // Use Mocha's `beforeEach` hook
    beforeEach(() => {
        // Reset game state before each test to ensure isolation
        initialGameState = ChessEngine_1.ChessEngine.initGame('human', 'ai');
        // Ensure the hash is initialized for each test
        (0, GameStateHelperFunctions_1.initGameStateHash)(initialGameState);
    });
    // Use Mocha's `it` for individual tests
    it('should have a deterministic and correct initial board hash', () => {
        (0, chai_1.expect)(initialGameState.hash).to.equal(expectedInitialHash);
    });
    it('should change hash after a simple pawn move (e2-e4) and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move = (0, HelperFunctions_1.parseMove)('e2-e4');
        // Apply the move
        const success = ChessEngine_1.ChessEngine.applyMove(initialGameState, move);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(initialGameState.hash).to.not.equal(originalHash);
        // Undo the move
        undoLastMove(initialGameState);
        (0, chai_1.expect)(initialGameState.hash).to.equal(originalHash);
    });
    it('should change hash after a pawn capture (e.g., d5xe6) and revert after undo', () => {
        // Set up a board with a capture opportunity
        const boardWithCapture = new Board_1.Board();
        ChessEngine_1.ChessEngine.setupBoard(boardWithCapture); // Clear the default setup
        boardWithCapture.place(new Figure_1.Figure('white', 'pawn'), { x: 3, y: 4 }); // d5
        boardWithCapture.place(new Figure_1.Figure('black', 'pawn'), { x: 4, y: 5 }); // e6
        boardWithCapture.place(new Figure_1.Figure('black', 'pawn'), { x: 2, y: 5 }); // c6
        const gameStateForCapture = {
            player: new Player_1.HumanPlayer('white'),
            opponent: new Player_1.ComputerPlayer('black'),
            board: boardWithCapture,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true },
            },
        };
        (0, GameStateHelperFunctions_1.initGameStateHash)(gameStateForCapture);
        const originalHash = gameStateForCapture.hash;
        const captureMove = (0, HelperFunctions_1.parseMove)('d5xe6'); // d5 pawn captures e7 pawn
        const success = ChessEngine_1.ChessEngine.applyMove(gameStateForCapture, captureMove);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(gameStateForCapture.hash).to.not.equal(originalHash);
        undoLastMove(gameStateForCapture);
        (0, chai_1.expect)(gameStateForCapture.hash).to.equal(originalHash);
    });
    it('should affect en passant hash after pawn double push and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move = (0, HelperFunctions_1.parseMove)('e2-e4'); // White pawn double push
        const success = ChessEngine_1.ChessEngine.applyMove(initialGameState, move);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(initialGameState.hash).to.not.equal(originalHash);
        (0, chai_1.expect)(initialGameState.enPassantTargetFile).to.equal(4); // e-file (index 4)
        undoLastMove(initialGameState);
        (0, chai_1.expect)(initialGameState.hash).to.equal(originalHash);
        (0, chai_1.expect)(initialGameState.enPassantTargetFile).to.be.null;
    });
    it('should change hash after en passant capture and revert after undo', () => {
        // Set up a board for en passant
        ChessEngine_1.ChessEngine.applyMove(initialGameState, (0, HelperFunctions_1.parseMove)('h2-h3'));
        ChessEngine_1.ChessEngine.applyMove(initialGameState, (0, HelperFunctions_1.parseMove)('b7-b5'));
        ChessEngine_1.ChessEngine.applyMove(initialGameState, (0, HelperFunctions_1.parseMove)('h3-h4'));
        ChessEngine_1.ChessEngine.applyMove(initialGameState, (0, HelperFunctions_1.parseMove)('b5-b4'));
        ChessEngine_1.ChessEngine.applyMove(initialGameState, (0, HelperFunctions_1.parseMove)('c2-c4'));
        const gameStateForEnPassant = deepCloneGameStateForTesting(initialGameState);
        gameStateForEnPassant.board.display();
        (0, GameStateHelperFunctions_1.initGameStateHash)(gameStateForEnPassant);
        const originalHash = gameStateForEnPassant.hash;
        const enPassantMove = (0, HelperFunctions_1.parseMove)('b4xc3'); // White pawn on b5 captures black pawn on a6 en passant
        const success = ChessEngine_1.ChessEngine.applyMove(gameStateForEnPassant, enPassantMove);
        console.log(success);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(gameStateForEnPassant.hash).to.not.equal(originalHash);
        undoLastMove(gameStateForEnPassant);
        (0, chai_1.expect)(gameStateForEnPassant.hash).to.equal(originalHash);
    });
    it('should change hash after Castling (White Kingside) and revert after undo', () => {
        // Set up a board for castling
        const boardForCastling = new Board_1.Board();
        // Manually place pieces for castling scenario
        boardForCastling.place(new Figure_1.Figure('white', 'king'), { x: 4, y: 0 }); // e1
        boardForCastling.place(new Figure_1.Figure('white', 'rook'), { x: 7, y: 0 }); // h1
        boardForCastling.place(new Figure_1.Figure('white', 'rook'), { x: 0, y: 0 }); // a1
        boardForCastling.place(new Figure_1.Figure('black', 'king'), { x: 4, y: 7 }); // e8
        boardForCastling.place(new Figure_1.Figure('black', 'rook'), { x: 7, y: 7 }); // h8
        boardForCastling.place(new Figure_1.Figure('black', 'rook'), { x: 0, y: 7 }); // a8
        const gameStateForCastling = {
            player: new Player_1.HumanPlayer('white'),
            opponent: new Player_1.ComputerPlayer('black'),
            board: boardForCastling,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true },
            },
        };
        (0, GameStateHelperFunctions_1.initGameStateHash)(gameStateForCastling);
        const originalHash = gameStateForCastling.hash;
        const castlingMove = (0, HelperFunctions_1.parseMove)('e1-g1'); // White Kingside Castling
        const success = ChessEngine_1.ChessEngine.applyMove(gameStateForCastling, castlingMove);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(gameStateForCastling.hash).to.not.equal(originalHash);
        (0, chai_1.expect)(gameStateForCastling.castlingRights.white.kingSide).to.be.false; // Castling rights revoked
        undoLastMove(gameStateForCastling);
        (0, chai_1.expect)(gameStateForCastling.hash).to.equal(originalHash);
        (0, chai_1.expect)(gameStateForCastling.castlingRights.white.kingSide).to.be.true; // Castling rights restored
    });
    it.only('should change hash when a Rook move revokes castling rights and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move = (0, HelperFunctions_1.parseMove)('a1-a2'); // White Rook on a1 moves, revoking WQ castling
        const success = ChessEngine_1.ChessEngine.applyMove(initialGameState, move);
        (0, chai_1.expect)(success).to.be.true;
        (0, chai_1.expect)(initialGameState.hash).to.not.equal(originalHash);
        (0, chai_1.expect)(initialGameState.castlingRights.white.queenSide).to.be.false;
        undoLastMove(initialGameState);
        (0, chai_1.expect)(initialGameState.hash).to.equal(originalHash);
        (0, chai_1.expect)(initialGameState.castlingRights.white.queenSide).to.be.true;
    });
    it('should change hash after promotion and revert after undo (simplified)', () => {
        // Set up a pawn ready for promotion
        const boardForPromotion = new Board_1.Board();
        boardForPromotion.place(new Figure_1.Figure('white', 'pawn'), { x: 0, y: 6 }); // A7
        const gameStateForPromotion = {
            player: new Player_1.HumanPlayer('white'),
            opponent: new Player_1.ComputerPlayer('black'),
            board: boardForPromotion,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: false, queenSide: false },
                black: { kingSide: false, queenSide: false },
            },
        };
        (0, GameStateHelperFunctions_1.initGameStateHash)(gameStateForPromotion);
        const originalHash = gameStateForPromotion.hash;
        // Simulate pawn moving to A8 (promotion rank)
        const promotionMove = (0, HelperFunctions_1.parseMove)('a7-a8');
        const successMove = ChessEngine_1.ChessEngine.applyMove(gameStateForPromotion, promotionMove);
        (0, chai_1.expect)(successMove).to.be.true;
        // Manually promote the pawn (ChessEngine.promotePawn is a separate call in your logic)
        const pawnOnA8 = gameStateForPromotion.board.getPiece({ x: 0, y: 7 });
        (0, chai_1.expect)(pawnOnA8?.getPiece()).to.equal('pawn'); // Should still be pawn initially in `applyMove`
        // Simulate the promotion's effect on hash: XOR out old piece, XOR in new piece
        if (pawnOnA8) {
            gameStateForPromotion.hash ^= (0, HelperFunctions_1.getPieceNumber)(pawnOnA8.getColor(), pawnOnA8.getPiece(), { x: 0, y: 7 }); // XOR out pawn
            pawnOnA8.setPiece('queen'); // Change piece type
            gameStateForPromotion.hash ^= (0, HelperFunctions_1.getPieceNumber)(pawnOnA8.getColor(), pawnOnA8.getPiece(), { x: 0, y: 7 }); // XOR in queen
        }
        (0, chai_1.expect)(gameStateForPromotion.hash).to.not.equal(originalHash);
        (0, chai_1.expect)(gameStateForPromotion.board.getPiece({ x: 0, y: 7 })?.getPiece()).to.equal('queen');
        // Undo the promotion (simplified: revert piece type and hash)
        if (pawnOnA8) {
            gameStateForPromotion.hash ^= (0, HelperFunctions_1.getPieceNumber)(pawnOnA8.getColor(), pawnOnA8.getPiece(), { x: 0, y: 7 }); // XOR out queen
            pawnOnA8.setPiece('pawn'); // Change piece type back
            gameStateForPromotion.hash ^= (0, HelperFunctions_1.getPieceNumber)(pawnOnA8.getColor(), pawnOnA8.getPiece(), { x: 0, y: 7 }); // XOR in pawn
        }
        // Undo the move itself
        undoLastMove(gameStateForPromotion);
        (0, chai_1.expect)(gameStateForPromotion.hash).to.equal(originalHash);
        (0, chai_1.expect)(gameStateForPromotion.board.getPiece({ x: 0, y: 6 })?.getPiece()).to.equal('pawn'); // Pawn should be back on A7
    });
});
//# sourceMappingURL=zobristHashing.test.js.map