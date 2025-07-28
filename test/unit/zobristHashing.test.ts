
// No direct import of PSEUDO_RANDOM_NUMBERS, PIECE_COLOR, PIECE_TYPE here as HelperFunctions already uses them
// and we rely on the fixed seed in Random.ts for determinism.

// Import Chai for assertions
import { expect } from 'chai';
import { Board } from '../../src/ChessClass/Board/Board';
import { ChessEngine } from '../../src/ChessClass/ChessEngine/ChessEngine';
import { Figure } from '../../src/ChessClass/Figure/Figure';
import { getPieceNumber } from '../../src/ChessClass/Hashing/HashConstants';
import { initGameStateHash } from '../../src/ChessClass/Hashing/HashFunctions';
import { parseMove } from '../../src/ChessClass/Moves/AlgNotation/AlgNotation';
import { Position, Move } from '../../src/ChessClass/Moves/MoveTypes';
import { HumanPlayer, ComputerPlayer } from '../../src/ChessClass/Player/Player';
import { ColorType } from '../../src/ChessClass/Player/PlayerTypes';
import { GameState, HistoryEntry, CastlingMoveInfo } from '../../src/ChessClass/types/ChessTypes';
// If you prefer assert style: import { assert } from 'chai';

// --- Helper function for testing: Deep clone GameState for isolation ---
// This is crucial for tests where you modify the state and then revert it.
// The cloneGameState from GameStateHelperFunctions.ts is good, but we need
// to ensure it handles the hash correctly for testing purposes.
// For testing purposes, we'll ensure the history is also cloned deeply enough
// so that undoing a move doesn't affect the original state's history.



describe('Zobrist Hashing Implementation', () => {
    let initialGameState: GameState;
    let expectedInitialHash: bigint;

    // Use Mocha's `before` hook (equivalent to Jest's `beforeAll`)
    before(() => {
        // Pre-calculate the expected hash for the initial board state.
        // You MUST run your `initGameStateHash` function once on the starting board
        // and paste the resulting bigint here.
        // For example, if your initial hash calculation gives 12345678901234567890n
        const tempBoard = new Board();
        ChessEngine.setupBoard(tempBoard); // Initialize pieces on the board
        const tempGameState: GameState = ChessEngine['initGame']({player: 'human', opponent: 'human'});
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
        initialGameState = ChessEngine.initGame({player: 'human', opponent: 'human'});
        // Ensure the hash is initialized for each test
        initGameStateHash(initialGameState);
    });

    // Use Mocha's `it` for individual tests
    it('should have a deterministic and correct initial board hash', () => {
        expect(initialGameState.hash).to.equal(expectedInitialHash);
    });

    it('should change hash after a simple pawn move (e2-e4) and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move: Move = parseMove('e2-e4');

        // Apply the move
        const success = ChessEngine.applyMove(initialGameState, move);
        expect(success).to.be.true;
        expect(initialGameState.hash).to.not.equal(originalHash);

        // Undo the move
        undoLastMove(initialGameState);
        expect(initialGameState.hash).to.equal(originalHash);
    });

    it('should change hash after a pawn capture (e.g., d5xe6) and revert after undo', () => {
        // Set up a board with a capture opportunity
        const boardWithCapture = new Board();
        ChessEngine.setupBoard(boardWithCapture); // Clear the default setup
        boardWithCapture.place(new Figure('white', 'pawn'), { x: 3, y: 4 }); // d5
        boardWithCapture.place(new Figure('black', 'pawn'), { x: 4, y: 5 }); // e6
        boardWithCapture.place(new Figure('black', 'pawn'), { x: 2, y: 5 }); // c6

        const gameStateForCapture: GameState = {
            player: new HumanPlayer('white'),
            opponent: new ComputerPlayer('black'),
            board: boardWithCapture,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true },
            },
        };
        initGameStateHash(gameStateForCapture);
        const originalHash = gameStateForCapture.hash;

        const captureMove: Move = parseMove('d5xe6'); // d5 pawn captures e7 pawn
        const success = ChessEngine.applyMove(gameStateForCapture, captureMove);
        expect(success).to.be.true;
        expect(gameStateForCapture.hash).to.not.equal(originalHash);

        undoLastMove(gameStateForCapture);
        expect(gameStateForCapture.hash).to.equal(originalHash);
    });

    it('should affect en passant hash after pawn double push and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move: Move = parseMove('e2-e4'); // White pawn double push

        const success = ChessEngine.applyMove(initialGameState, move);
        expect(success).to.be.true;
        expect(initialGameState.hash).to.not.equal(originalHash);
        expect(initialGameState.enPassantTargetFile).to.equal(4); // e-file (index 4)

        undoLastMove(initialGameState);
        expect(initialGameState.hash).to.equal(originalHash);
        expect(initialGameState.enPassantTargetFile).to.be.null;
    });

    it('should change hash after en passant capture and revert after undo', () => {
        // Set up a board for en passant
        ChessEngine.applyMove(initialGameState, parseMove('h2-h3'));
        ChessEngine.applyMove(initialGameState, parseMove('b7-b5'));
        ChessEngine.applyMove(initialGameState, parseMove('h3-h4'));
        ChessEngine.applyMove(initialGameState, parseMove('b5-b4'));

        ChessEngine.applyMove(initialGameState, parseMove('c2-c4'));

        const gameStateForEnPassant: GameState = deepCloneGameStateForTesting(initialGameState);

        gameStateForEnPassant.board.display();
        
        initGameStateHash(gameStateForEnPassant);
        const originalHash = gameStateForEnPassant.hash;

        const enPassantMove: Move = parseMove('b4xc3'); // White pawn on b5 captures black pawn on a6 en passant
        const success = ChessEngine.applyMove(gameStateForEnPassant, enPassantMove);
        console.log(success);
        expect(success).to.be.true;
        expect(gameStateForEnPassant.hash).to.not.equal(originalHash);

        undoLastMove(gameStateForEnPassant);
        expect(gameStateForEnPassant.hash).to.equal(originalHash);
    });

    it('should change hash after Castling (White Kingside) and revert after undo', () => {
        // Set up a board for castling
        const boardForCastling = new Board();
        // Manually place pieces for castling scenario
        boardForCastling.place(new Figure('white', 'king'), { x: 4, y: 0 }); // e1
        boardForCastling.place(new Figure('white', 'rook'), { x: 7, y: 0 }); // h1
        boardForCastling.place(new Figure('white', 'rook'), { x: 0, y: 0 }); // a1
        boardForCastling.place(new Figure('black', 'king'), { x: 4, y: 7 }); // e8
        boardForCastling.place(new Figure('black', 'rook'), { x: 7, y: 7 }); // h8
        boardForCastling.place(new Figure('black', 'rook'), { x: 0, y: 7 }); // a8

        const gameStateForCastling: GameState = {
            player: new HumanPlayer('white'),
            opponent: new ComputerPlayer('black'),
            board: boardForCastling,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: true, queenSide: true },
                black: { kingSide: true, queenSide: true },
            },
        };
        initGameStateHash(gameStateForCastling);
        const originalHash = gameStateForCastling.hash;

        const castlingMove: Move = parseMove('e1-g1'); // White Kingside Castling
        const success = ChessEngine.applyMove(gameStateForCastling, castlingMove);
        expect(success).to.be.true;
        expect(gameStateForCastling.hash).to.not.equal(originalHash);
        expect(gameStateForCastling.castlingRights.white.kingSide).to.be.false; // Castling rights revoked

        undoLastMove(gameStateForCastling);
        expect(gameStateForCastling.hash).to.equal(originalHash);
        expect(gameStateForCastling.castlingRights.white.kingSide).to.be.true; // Castling rights restored
    });

    it.only('should change hash when a Rook move revokes castling rights and revert after undo', () => {
        const originalHash = initialGameState.hash;
        const move: Move = parseMove('a1-a2'); // White Rook on a1 moves, revoking WQ castling

        const success = ChessEngine.applyMove(initialGameState, move);
        expect(success).to.be.true;
        expect(initialGameState.hash).to.not.equal(originalHash);
        expect(initialGameState.castlingRights.white.queenSide).to.be.false;

        undoLastMove(initialGameState);
        expect(initialGameState.hash).to.equal(originalHash);
        expect(initialGameState.castlingRights.white.queenSide).to.be.true;
    });

    it('should change hash after promotion and revert after undo (simplified)', () => {
        // Set up a pawn ready for promotion
        const boardForPromotion = new Board();
        boardForPromotion.place(new Figure('white', 'pawn'), { x: 0, y: 6 }); // A7

        const gameStateForPromotion: GameState = {
            player: new HumanPlayer('white'),
            opponent: new ComputerPlayer('black'),
            board: boardForPromotion,
            moveHistory: [],
            checked: { whiteKingChecked: false, blackKingChecked: false },
            enPassantTargetFile: null,
            castlingRights: {
                white: { kingSide: false, queenSide: false },
                black: { kingSide: false, queenSide: false },
            },
        };
        initGameStateHash(gameStateForPromotion);
        const originalHash = gameStateForPromotion.hash;

        // Simulate pawn moving to A8 (promotion rank)
        const promotionMove: Move = parseMove('a7-a8');
        const successMove = ChessEngine.applyMove(gameStateForPromotion, promotionMove);
        expect(successMove).to.be.true;

        // Manually promote the pawn (ChessEngine.promotePawn is a separate call in your logic)
        const pawnOnA8 = gameStateForPromotion.board.getPiece({x:0, y:7});
        expect(pawnOnA8?.getPiece()).to.equal('pawn'); // Should still be pawn initially in `applyMove`

        // Simulate the promotion's effect on hash: XOR out old piece, XOR in new piece
        if (pawnOnA8) {
            gameStateForPromotion.hash ^= getPieceNumber(pawnOnA8.getColor(), pawnOnA8.getPiece(), {x:0, y:7}); // XOR out pawn
            pawnOnA8.setPiece('queen'); // Change piece type
            gameStateForPromotion.hash ^= getPieceNumber(pawnOnA8.getColor(), pawnOnA8.getPiece(), {x:0, y:7}); // XOR in queen
        }

        expect(gameStateForPromotion.hash).to.not.equal(originalHash);
        expect(gameStateForPromotion.board.getPiece({x:0, y:7})?.getPiece()).to.equal('queen');

        // Undo the promotion (simplified: revert piece type and hash)
        if (pawnOnA8) {
            gameStateForPromotion.hash ^= getPieceNumber(pawnOnA8.getColor(), pawnOnA8.getPiece(), {x:0, y:7}); // XOR out queen
            pawnOnA8.setPiece('pawn'); // Change piece type back
            gameStateForPromotion.hash ^= getPieceNumber(pawnOnA8.getColor(), pawnOnA8.getPiece(), {x:0, y:7}); // XOR in pawn
        }
        // Undo the move itself
        undoLastMove(gameStateForPromotion);

        expect(gameStateForPromotion.hash).to.equal(originalHash);
        expect(gameStateForPromotion.board.getPiece({x:0, y:6})?.getPiece()).to.equal('pawn'); // Pawn should be back on A7
    });
});


