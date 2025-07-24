"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// test/unit/ChessEngine.test.ts
const chai_1 = require("chai");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const Board_1 = require("../../src/ChessClass/Board");
const Player_1 = require("../../src/ChessClass/Player");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions"); // Need access to helper functions for deep comparison of states or moves
const HelperTestFunctions_1 = require("../HelperTestFunctions");
describe('ChessEngine Unit Tests', () => {
    // Test initGame
    describe('initGame()', () => {
        it('should initialize a new game state correctly with human players', () => {
            const gameState = ChessEngine_1.ChessEngine.initGame('human', 'human');
            (0, chai_1.expect)(gameState).to.exist;
            (0, chai_1.expect)(gameState.player).to.be.an.instanceOf(Player_1.HumanPlayer);
            (0, chai_1.expect)(gameState.player.getColor()).to.equal('white');
            (0, chai_1.expect)(gameState.opponent).to.be.an.instanceOf(Player_1.HumanPlayer);
            (0, chai_1.expect)(gameState.opponent.getColor()).to.equal('black');
            (0, chai_1.expect)(gameState.board).to.be.an.instanceOf(Board_1.Board);
            (0, chai_1.expect)(gameState.moveHistory).to.be.an('array').and.to.have.lengthOf(0);
            (0, chai_1.expect)(gameState.checked.whiteKingChecked).to.be.false;
            (0, chai_1.expect)(gameState.checked.blackKingChecked).to.be.false;
            // Verify board setup
            (0, chai_1.expect)(gameState.board.grid[0][0]?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(gameState.board.grid[7][7]?.getColor()).to.equal('black');
            (0, chai_1.expect)(gameState.board.grid[1][0]?.getPiece()).to.equal('pawn');
            (0, chai_1.expect)(gameState.board.grid[6][0]?.getColor()).to.equal('black');
            (0, chai_1.expect)(gameState.board.grid[3][3]).to.be.null; // Center should be empty
        });
        it('should initialize a new game state correctly with AI players', () => {
            const gameState = ChessEngine_1.ChessEngine.initGame('ai', 'ai');
            (0, chai_1.expect)(gameState.player).to.be.an.instanceOf(Player_1.ComputerPlayer);
            (0, chai_1.expect)(gameState.opponent).to.be.an.instanceOf(Player_1.ComputerPlayer);
        });
    });
    // Test setupBoard
    describe('setupBoard()', () => {
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Start with an empty board
            ChessEngine_1.ChessEngine.setupBoard(board);
        });
        it('should place 16 white pieces correctly', () => {
            let whitePieceCount = 0;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board.grid[y][x];
                    if (piece && piece.getColor() === 'white') {
                        whitePieceCount++;
                    }
                }
            }
            (0, chai_1.expect)(whitePieceCount).to.equal(16);
            // Verify specific white piece placements
            (0, chai_1.expect)(board.grid[0][0]?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(board.grid[0][0]?.getColor()).to.equal('white');
            (0, chai_1.expect)(board.grid[0][4]?.getPiece()).to.equal('king');
            (0, chai_1.expect)(board.grid[0][4]?.getColor()).to.equal('white');
            (0, chai_1.expect)(board.grid[1][0]?.getPiece()).to.equal('pawn');
            (0, chai_1.expect)(board.grid[1][0]?.getColor()).to.equal('white');
            (0, chai_1.expect)(board.grid[1][7]?.getPiece()).to.equal('pawn');
            (0, chai_1.expect)(board.grid[1][7]?.getColor()).to.equal('white');
        });
        it('should place 16 black pieces correctly', () => {
            let blackPieceCount = 0;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const piece = board.grid[y][x];
                    if (piece && piece.getColor() === 'black') {
                        blackPieceCount++;
                    }
                }
            }
            (0, chai_1.expect)(blackPieceCount).to.equal(16);
            // Verify specific black piece placements
            (0, chai_1.expect)(board.grid[7][0]?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(board.grid[7][0]?.getColor()).to.equal('black');
            (0, chai_1.expect)(board.grid[7][4]?.getPiece()).to.equal('king');
            (0, chai_1.expect)(board.grid[7][4]?.getColor()).to.equal('black');
            (0, chai_1.expect)(board.grid[6][0]?.getPiece()).to.equal('pawn');
            (0, chai_1.expect)(board.grid[6][0]?.getColor()).to.equal('black');
            (0, chai_1.expect)(board.grid[6][7]?.getPiece()).to.equal('pawn');
            (0, chai_1.expect)(board.grid[6][7]?.getColor()).to.equal('black');
        });
        it('should leave middle rows empty', () => {
            for (let y = 2; y <= 5; y++) {
                for (let x = 0; x < 8; x++) {
                    (0, chai_1.expect)(board.grid[y][x]).to.be.null;
                }
            }
        });
    });
    // Test getPawnMoves
    describe('getPawnMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Start with empty board for specific setups
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid); // Create gameState with this board
        });
        it('should return 2 initial moves for a white pawn on its starting square', () => {
            const pawnPos = { x: 0, y: 1 }; // A2
            const pawn = new Figure_1.Figure('white', 'pawn');
            board.place(pawn, pawnPos);
            gameState.player = new Player_1.HumanPlayer('white'); // Ensure player matches piece color
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, pawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(2);
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 0, y: 2 } });
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 0, y: 3 } });
        });
        it('should return 1 move for a white pawn that has already moved one square', () => {
            const pawnPos = { x: 0, y: 2 }; // A3
            const pawn = new Figure_1.Figure('white', 'pawn');
            board.place(pawn, pawnPos);
            gameState.player = new Player_1.HumanPlayer('white');
            // Simulate a previous move so isFirstMove returns false
            const prevMoveEntry = {
                type: 'move',
                player: new Player_1.HumanPlayer('white'),
                board: new Board_1.Board(), // dummy
                piece: pawn,
                move: { start: { x: 0, y: 1 }, end: { x: 0, y: 2 } },
                destroyedPiece: null,
                opponentKingChecked: false,
            };
            gameState.moveHistory.push(prevMoveEntry);
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, pawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(1);
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 0, y: 3 } });
            (0, chai_1.expect)(moves.map(m => m.move)).to.not.deep.include({ start: pawnPos, end: { x: 0, y: 4 } });
        });
        it('should return 0 moves if pawn is blocked directly in front', () => {
            const pawnPos = { x: 0, y: 1 }; // A2
            const pawn = new Figure_1.Figure('white', 'pawn');
            const blocker = new Figure_1.Figure('black', 'rook'); // Or any piece
            board.place(pawn, pawnPos);
            board.place(blocker, { x: 0, y: 2 }); // Block one square ahead
            gameState.player = new Player_1.HumanPlayer('white');
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, pawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(0);
        });
        it('should return 1 diagonal capture move for a white pawn', () => {
            const pawnPos = { x: 1, y: 1 }; // B2
            const pawn = new Figure_1.Figure('white', 'pawn');
            const enemy = new Figure_1.Figure('black', 'pawn');
            board.place(pawn, pawnPos);
            board.place(enemy, { x: 2, y: 2 }); // Enemy on C3
            gameState.player = new Player_1.HumanPlayer('white');
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, pawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(3); // two forward moves + one capture
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 2, y: 2 } });
            const captureEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: pawnPos, end: { x: 2, y: 2 } }));
            (0, chai_1.expect)(captureEntry?.destroyedPiece).to.deep.equal(enemy);
            (0, chai_1.expect)(captureEntry?.type).to.equal('attackMove');
        });
        it('should return 2 diagonal capture moves for a white pawn', () => {
            const pawnPos = { x: 4, y: 1 }; // E2
            const pawn = new Figure_1.Figure('white', 'pawn');
            const enemy1 = new Figure_1.Figure('black', 'pawn');
            const enemy2 = new Figure_1.Figure('black', 'pawn');
            board.place(pawn, pawnPos);
            board.place(enemy1, { x: 3, y: 2 }); // Enemy on D3
            board.place(enemy2, { x: 5, y: 2 }); // Enemy on F3
            gameState.player = new Player_1.HumanPlayer('white');
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, pawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(4); // One forward move + two captures
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 3, y: 2 } });
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include({ start: pawnPos, end: { x: 5, y: 2 } });
        });
        it('should generate en passant move for white pawn', () => {
            const whitePawnPos = { x: 4, y: 4 }; // E5
            const blackPawnPos = { x: 5, y: 4 }; // F5
            const whitePawn = new Figure_1.Figure('white', 'pawn');
            const blackPawn = new Figure_1.Figure('black', 'pawn');
            board.place(whitePawn, whitePawnPos);
            board.place(blackPawn, blackPawnPos);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.HumanPlayer('black');
            // Simulate black pawn moving two squares
            const simulatedBoardAfterBlackMove = new Board_1.Board();
            simulatedBoardAfterBlackMove.place(blackPawn, blackPawnPos); // F5
            simulatedBoardAfterBlackMove.removePiece({ x: 5, y: 6 }); // F7 (original pos)
            const lastMoveEntry = {
                type: 'move',
                player: new Player_1.HumanPlayer('black'),
                board: simulatedBoardAfterBlackMove,
                piece: blackPawn,
                move: { start: { x: 5, y: 6 }, end: blackPawnPos },
                destroyedPiece: null,
                opponentKingChecked: false,
            };
            gameState.moveHistory.push(lastMoveEntry);
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, whitePawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(2); // 1 normal forward, 1 en passant
            const enPassantMove = { start: whitePawnPos, end: { x: 5, y: 5 } }; // E5 to F6 (diagonal)
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include(enPassantMove);
            const enPassantEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, enPassantMove));
            (0, chai_1.expect)(enPassantEntry?.type).to.equal('attackMove');
            (0, chai_1.expect)(enPassantEntry?.destroyedPiece).to.deep.equal(blackPawn);
        });
        it('should not generate en passant move if last move was not opponent pawn 2 squares', () => {
            const whitePawnPos = { x: 4, y: 4 }; // E5
            const blackPawnPos = { x: 5, y: 4 }; // F5
            const whitePawn = new Figure_1.Figure('white', 'pawn');
            const blackPawn = new Figure_1.Figure('black', 'pawn');
            board.place(whitePawn, whitePawnPos);
            board.place(blackPawn, blackPawnPos);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.HumanPlayer('black');
            // Simulate black pawn moving *one* square instead of two
            const lastMoveEntry = {
                type: 'move',
                player: new Player_1.HumanPlayer('black'),
                board: new Board_1.Board(),
                piece: blackPawn,
                move: { start: { x: 5, y: 5 }, end: blackPawnPos }, // F6 to F5
                destroyedPiece: null,
                opponentKingChecked: false,
            };
            gameState.moveHistory.push(lastMoveEntry);
            const moves = ChessEngine_1.ChessEngine['getPawnMoves'](gameState, whitePawnPos);
            (0, chai_1.expect)(moves).to.have.lengthOf(1); // Only normal forward move
            const enPassantMove = { start: whitePawnPos, end: { x: 5, y: 5 } };
            (0, chai_1.expect)(moves.map(m => m.move)).to.not.deep.include(enPassantMove);
        });
    });
    // Test getKnightMoves
    describe('getKnightMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
        });
        it('should return 8 pseudo-legal moves for a knight on an empty board (e.g., D4)', () => {
            const knightPos = { x: 3, y: 3 }; // D4
            const knight = new Figure_1.Figure('white', 'knight');
            board.place(knight, knightPos);
            const moves = ChessEngine_1.ChessEngine['getKnightMoves'](gameState, knightPos);
            const expectedEnds = [
                { x: 4, y: 5 }, { x: 2, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 2 },
                { x: 1, y: 4 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 4, y: 1 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(8);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
        it('should return correct moves from a corner (e.g., A1)', () => {
            const knightPos = { x: 0, y: 0 }; // A1
            const knight = new Figure_1.Figure('white', 'knight');
            board.place(knight, knightPos);
            const moves = ChessEngine_1.ChessEngine['getKnightMoves'](gameState, knightPos);
            const expectedEnds = [{ x: 1, y: 2 }, { x: 2, y: 1 }];
            (0, chai_1.expect)(moves).to.have.lengthOf(2);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
        it('should block moves to squares occupied by allied pieces', () => {
            const knightPos = { x: 3, y: 3 }; // D4
            const knight = new Figure_1.Figure('white', 'knight');
            const ally = new Figure_1.Figure('white', 'pawn');
            board.place(knight, knightPos);
            board.place(ally, { x: 4, y: 5 }); // Block one square
            const moves = ChessEngine_1.ChessEngine['getKnightMoves'](gameState, knightPos);
            const expectedEnds = [
                // { x: 4, y: 5 }, // This one should be blocked
                { x: 2, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 2 },
                { x: 1, y: 4 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 4, y: 1 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(7);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.not.deep.include({ x: 4, y: 5 });
        });
        it('should include capture moves for squares occupied by enemy pieces', () => {
            const knightPos = { x: 3, y: 3 }; // D4
            const knight = new Figure_1.Figure('white', 'knight');
            const enemy = new Figure_1.Figure('black', 'pawn');
            board.place(knight, knightPos);
            board.place(enemy, { x: 4, y: 5 }); // Enemy on one square
            const moves = ChessEngine_1.ChessEngine['getKnightMoves'](gameState, knightPos);
            const expectedEnds = [
                { x: 4, y: 5 }, // This one should be a capture
                { x: 2, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 2 },
                { x: 1, y: 4 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 4, y: 1 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(8);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
            const captureEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: knightPos, end: { x: 4, y: 5 } }));
            (0, chai_1.expect)(captureEntry?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry?.destroyedPiece).to.deep.equal(enemy);
        });
    });
    // Test getRookMoves
    describe('getRookMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
        });
        it('should return 14 pseudo-legal moves for a rook on an empty board (e.g., D4)', () => {
            const rookPos = { x: 3, y: 3 }; // D4
            const rook = new Figure_1.Figure('white', 'rook');
            board.place(rook, rookPos);
            const moves = ChessEngine_1.ChessEngine['getRookMoves'](gameState, rookPos);
            // 7 moves in each of 4 directions = 28. (Should be 7 + 7 = 14 from center)
            // Rook moves are: x=3, y=[0-7] (8 moves), y=3, x=[0-7] (8 moves)
            // Excluding (3,3) itself, 7+7 = 14
            (0, chai_1.expect)(moves).to.have.lengthOf(14);
            // Verify some specific moves
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 3, y: 0 }); // A1
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 3, y: 7 }); // A8
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 0, y: 3 }); // D1
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 7, y: 3 }); // D8
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.not.deep.include(rookPos); // Should not include its own position
        });
        it('should be blocked by allied pieces', () => {
            const rookPos = { x: 3, y: 3 }; // D4
            const rook = new Figure_1.Figure('white', 'rook');
            const ally = new Figure_1.Figure('white', 'pawn');
            board.place(rook, rookPos);
            board.place(ally, { x: 3, y: 5 }); // Ally at D6 (blocks D7, D8)
            const moves = ChessEngine_1.ChessEngine['getRookMoves'](gameState, rookPos);
            const ends = moves.map(m => m.move.end);
            (0, chai_1.expect)(ends).to.deep.include({ x: 3, y: 4 }); // D5 (move before ally)
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 5 }); // Ally's position
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 6 }); // D7 (blocked by ally)
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 7 }); // D8 (blocked by ally)
            // Total expected moves: 7 (x-axis) + 1 (y-axis up to ally) + 3 (y-axis down) = 11
            (0, chai_1.expect)(moves).to.have.lengthOf(11);
        });
        it('should capture enemy pieces and stop movement beyond them', () => {
            const rookPos = { x: 3, y: 3 }; // D4
            const rook = new Figure_1.Figure('white', 'rook');
            const enemy = new Figure_1.Figure('black', 'pawn');
            board.place(rook, rookPos);
            board.place(enemy, { x: 3, y: 5 }); // Enemy at D6 (capture)
            const moves = ChessEngine_1.ChessEngine['getRookMoves'](gameState, rookPos);
            const ends = moves.map(m => m.move.end);
            (0, chai_1.expect)(ends).to.deep.include({ x: 3, y: 4 }); // E5
            (0, chai_1.expect)(ends).to.deep.include({ x: 3, y: 5 }); // F6 (capture square)
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 6 }); // G7 (blocked by captured piece)
            const captureEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: rookPos, end: { x: 3, y: 5 } }));
            (0, chai_1.expect)(captureEntry?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry?.destroyedPiece).to.deep.equal(enemy);
            // Expected total moves: 7 (x-axis) + 2 (y-axis including capture) + 3 (y-axis down) = 12
            (0, chai_1.expect)(moves).to.have.lengthOf(12);
        });
        it('should return correct moves from a corner (e.g., A1)', () => {
            const rookPos = { x: 0, y: 0 }; // A1
            const rook = new Figure_1.Figure('white', 'rook');
            board.place(rook, rookPos);
            const moves = ChessEngine_1.ChessEngine['getRookMoves'](gameState, rookPos);
            const expectedEnds = [
                { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, // Right
                { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 } // Up
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(14);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
    });
    // Test getBishopMoves
    describe('getBishopMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
        });
        it('should return 13 pseudo-legal moves for a bishop on an empty board (e.g., D4)', () => {
            const bishopPos = { x: 3, y: 3 }; // D4
            const bishop = new Figure_1.Figure('white', 'bishop');
            board.place(bishop, bishopPos);
            const moves = ChessEngine_1.ChessEngine['getBishopMoves'](gameState, bishopPos);
            // D4:
            // Up-right: E5, F6, G7, H8 (4)
            // Down-left: C3, B2, A1 (3)
            // Up-left: C5, B6, A7 (3)
            // Down-right: E3, F2, G1, H0 (3)
            // Total: 4 + 3 + 3 + 3 = 13
            (0, chai_1.expect)(moves).to.have.lengthOf(13);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 7, y: 7 }); // H8
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 0, y: 0 }); // A1
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 0, y: 6 }); // A7
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.deep.include({ x: 6, y: 0 }); // G1
        });
        it('should be blocked by allied pieces', () => {
            const bishopPos = { x: 3, y: 3 }; // D4
            const bishop = new Figure_1.Figure('white', 'bishop');
            const ally = new Figure_1.Figure('white', 'pawn');
            board.place(bishop, bishopPos);
            board.place(ally, { x: 5, y: 5 }); // Ally at F6 (blocks G7, H8)
            const moves = ChessEngine_1.ChessEngine['getBishopMoves'](gameState, bishopPos);
            const ends = moves.map(m => m.move.end);
            (0, chai_1.expect)(ends).to.deep.include({ x: 4, y: 4 }); // E5 (move before ally)
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 5, y: 5 }); // Ally's position
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 6, y: 6 }); // G7 (blocked by ally)
        });
        it('should capture enemy pieces and stop movement beyond them', () => {
            const bishopPos = { x: 3, y: 3 }; // D4
            const bishop = new Figure_1.Figure('white', 'bishop');
            const enemy = new Figure_1.Figure('black', 'pawn');
            board.place(bishop, bishopPos);
            board.place(enemy, { x: 5, y: 5 }); // Enemy at F6 (capture)
            const moves = ChessEngine_1.ChessEngine['getBishopMoves'](gameState, bishopPos);
            const ends = moves.map(m => m.move.end);
            (0, chai_1.expect)(ends).to.deep.include({ x: 4, y: 4 }); // E5
            (0, chai_1.expect)(ends).to.deep.include({ x: 5, y: 5 }); // F6 (capture square)
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 6, y: 6 }); // G7 (blocked by captured piece)
            const captureEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: bishopPos, end: { x: 5, y: 5 } }));
            (0, chai_1.expect)(captureEntry?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry?.destroyedPiece).to.deep.equal(enemy);
        });
        it('should return correct moves from a corner (e.g., A1)', () => {
            const bishopPos = { x: 0, y: 0 }; // A1
            const bishop = new Figure_1.Figure('white', 'bishop');
            board.place(bishop, bishopPos);
            const moves = ChessEngine_1.ChessEngine['getBishopMoves'](gameState, bishopPos);
            const expectedEnds = [
                { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 } // Up-Right
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(7);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
    });
    // Test getQueenMoves
    describe('getQueenMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
        });
        it('should return 27 pseudo-legal moves for a queen on an empty board (e.g., D4)', () => {
            const queenPos = { x: 3, y: 3 }; // D4
            const queen = new Figure_1.Figure('white', 'queen');
            board.place(queen, queenPos);
            const moves = ChessEngine_1.ChessEngine['getQueenMoves'](gameState, queenPos);
            // Queen combines Rook (14 moves from center) + Bishop (13 moves from center) = 27
            (0, chai_1.expect)(moves).to.have.lengthOf(27);
        });
        it('should be blocked by allied pieces in all directions', () => {
            const queenPos = { x: 3, y: 3 }; // D4
            const queen = new Figure_1.Figure('white', 'queen');
            const ally1 = new Figure_1.Figure('white', 'pawn'); // Blocks horizontally
            const ally2 = new Figure_1.Figure('white', 'pawn'); // Blocks diagonally
            board.place(queen, queenPos);
            board.place(ally1, { x: 3, y: 5 }); // D6
            board.place(ally2, { x: 5, y: 5 }); // F6
            const moves = ChessEngine_1.ChessEngine['getQueenMoves'](gameState, queenPos);
            const ends = moves.map(m => m.move.end);
            // Check vertical block (D6 should not be included)
            (0, chai_1.expect)(ends).to.deep.include({ x: 3, y: 4 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 5 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 6 });
            // Check diagonal block (F6 should not be included)
            (0, chai_1.expect)(ends).to.deep.include({ x: 4, y: 4 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 5, y: 5 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 6, y: 6 });
            // Expect total moves to be less than 27 (27 - 2 (vertical blocked) - 2 (diagonal blocked) = 23)
            // This is a rough count, actual count needs careful calculation of paths, but the presence/absence check is more direct.
            (0, chai_1.expect)(moves.length).to.be.lessThan(27);
        });
        it('should capture enemy pieces and stop movement beyond them in all directions', () => {
            const queenPos = { x: 3, y: 3 }; // D4
            const queen = new Figure_1.Figure('white', 'queen');
            const enemy1 = new Figure_1.Figure('black', 'pawn'); // Horizontal capture
            const enemy2 = new Figure_1.Figure('black', 'pawn'); // Diagonal capture
            board.place(queen, queenPos);
            board.place(enemy1, { x: 3, y: 5 }); // D6
            board.place(enemy2, { x: 5, y: 5 }); // F6
            const moves = ChessEngine_1.ChessEngine['getQueenMoves'](gameState, queenPos);
            const ends = moves.map(m => m.move.end);
            // Check vertical capture
            (0, chai_1.expect)(ends).to.deep.include({ x: 3, y: 5 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 3, y: 6 }); // Blocked after capture
            // Check diagonal capture
            (0, chai_1.expect)(ends).to.deep.include({ x: 5, y: 5 });
            (0, chai_1.expect)(ends).to.not.deep.include({ x: 6, y: 6 }); // Blocked after capture
            // Verify capture entries
            const captureEntry1 = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: queenPos, end: { x: 3, y: 5 } }));
            (0, chai_1.expect)(captureEntry1?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry1?.destroyedPiece).to.deep.equal(enemy1);
            const captureEntry2 = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: queenPos, end: { x: 5, y: 5 } }));
            (0, chai_1.expect)(captureEntry2?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry2?.destroyedPiece).to.deep.equal(enemy2);
        });
    });
    // Test getKingMoves
    describe('getKingMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
        });
        it('should return 8 pseudo-legal moves for a king on an empty board (e.g., D4)', () => {
            const kingPos = { x: 3, y: 3 }; // D4
            const king = new Figure_1.Figure('white', 'king');
            board.place(king, kingPos);
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const expectedEnds = [
                { x: 3, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 3 },
                { x: 4, y: 4 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 2 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(8);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
        it('should return correct moves from a corner (e.g., A1)', () => {
            const kingPos = { x: 0, y: 0 }; // A1
            const king = new Figure_1.Figure('white', 'king');
            board.place(king, kingPos);
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const expectedEnds = [
                { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(3);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
        });
        it('should block moves to squares occupied by allied pieces', () => {
            const kingPos = { x: 3, y: 3 }; // D4
            const king = new Figure_1.Figure('white', 'king');
            const ally = new Figure_1.Figure('white', 'pawn');
            board.place(king, kingPos);
            board.place(ally, { x: 4, y: 4 }); // Ally at E5
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const expectedEnds = [
                { x: 3, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 3 },
                // { x: 4, y: 4 }, // Blocked
                { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 2 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(7);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.not.deep.include({ x: 4, y: 4 });
        });
        it('should include capture moves for squares occupied by enemy pieces', () => {
            const kingPos = { x: 3, y: 3 }; // D4
            const king = new Figure_1.Figure('white', 'king');
            const enemy = new Figure_1.Figure('black', 'pawn');
            board.place(king, kingPos);
            board.place(enemy, { x: 4, y: 4 }); // Enemy at E5
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const expectedEnds = [
                { x: 3, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 3 }, { x: 2, y: 3 },
                { x: 4, y: 4 }, // This is a capture
                { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 2 }
            ];
            (0, chai_1.expect)(moves).to.have.lengthOf(8);
            (0, chai_1.expect)(moves.map(m => m.move.end)).to.have.deep.members(expectedEnds);
            const captureEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, { start: kingPos, end: { x: 4, y: 4 } }));
            (0, chai_1.expect)(captureEntry?.type).to.equal('attackMove');
            (0, chai_1.expect)(captureEntry?.destroyedPiece).to.deep.equal(enemy);
        });
        // Castling tests - simplified, relies on getCastlingMoves
        it('should include castling moves if conditions are met (kingside)', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const rookPos = { x: 7, y: 0 }; // H1
            const king = new Figure_1.Figure('white', 'king');
            const rook = new Figure_1.Figure('white', 'rook');
            board.place(king, kingPos);
            board.place(rook, rookPos);
            // Ensure no pieces are between King and Rook
            board.removePiece({ x: 5, y: 0 }); // F1
            board.removePiece({ x: 6, y: 0 }); // G1
            // Ensure king and rook haven't moved (history is empty)
            gameState.moveHistory = [];
            // Ensure king is not in check
            // For now, assume it's not. Real test would set up more complex board.
            // isKingChecked is called in getCastlingMoves, mock it for unit test of castling logic if needed.
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const castlingMove = { start: kingPos, end: { x: 6, y: 0 } }; // E1 to G1
            (0, chai_1.expect)(moves.map(m => m.move)).to.deep.include(castlingMove);
            const castlingEntry = moves.find(m => (0, HelperFunctions_1.isSameMove)(m.move, castlingMove));
            (0, chai_1.expect)(castlingEntry?.type).to.equal('castling');
            (0, chai_1.expect)(castlingEntry?.rookPiece?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(castlingEntry?.rookMove).to.deep.equal({ start: rookPos, end: { x: 5, y: 0 } }); // H1 to F1
        });
        it('should not include castling moves if king has moved', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const rookPos = { x: 7, y: 0 }; // H1
            const king = new Figure_1.Figure('white', 'king');
            const rook = new Figure_1.Figure('white', 'rook');
            board.place(king, kingPos);
            board.place(rook, rookPos);
            // Simulate king having moved
            const kingMovedEntry = {
                type: 'move',
                player: new Player_1.HumanPlayer('white'),
                board: new Board_1.Board(), // dummy
                piece: king,
                move: { start: { x: 3, y: 0 }, end: kingPos }, // E1
                destroyedPiece: null,
                opponentKingChecked: false,
            };
            gameState.moveHistory.push(kingMovedEntry);
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const castlingMove = { start: kingPos, end: { x: 6, y: 0 } };
            (0, chai_1.expect)(moves.map(m => m.move)).to.not.deep.include(castlingMove);
        });
        it('should not include castling moves if path is blocked', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const rookPos = { x: 7, y: 0 }; // H1
            const king = new Figure_1.Figure('white', 'king');
            const rook = new Figure_1.Figure('white', 'rook');
            const blocker = new Figure_1.Figure('white', 'knight'); // Knight blocking F1
            board.place(king, kingPos);
            board.place(rook, rookPos);
            board.place(blocker, { x: 5, y: 0 }); // F1
            const moves = ChessEngine_1.ChessEngine['getKingMoves'](gameState, kingPos);
            const castlingMove = { start: kingPos, end: { x: 6, y: 0 } };
            (0, chai_1.expect)(moves.map(m => m.move)).to.not.deep.include(castlingMove);
        });
    });
    // Test getLegalMoves
    describe('getLegalMoves()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Start with empty board
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
        });
        it('should filter out moves that leave the king in check (pinned piece)', () => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            const whiteKing = new Figure_1.Figure('white', 'king');
            const whitePawn = new Figure_1.Figure('white', 'pawn'); // Pinned pawn
            const blackRook = new Figure_1.Figure('black', 'rook'); // Attacker
            const kingPos = (0, HelperFunctions_1.parseAlgNotation)('d2'); // E1
            const pawnPos = (0, HelperFunctions_1.parseAlgNotation)('e2'); // E2 (Pawn from the right to king)
            const rookPos = (0, HelperFunctions_1.parseAlgNotation)('h2'); // E8 (Rook on same file as king and pawn)
            board.place(whiteKing, kingPos);
            board.place(whitePawn, pawnPos);
            board.place(blackRook, rookPos);
            // Now, white pawn at E2 is pinned. It can move forward.
            // Pseudo-legal moves for E2 pawn: E3, E4 (if first move)
            // But moving to E3 or E4 would expose the king to the rook on E8.
            const pawnMoves = ChessEngine_1.ChessEngine.getMoves(gameState, pawnPos); // Pseudo-legal
            (0, chai_1.expect)(pawnMoves).to.not.be.empty; // Should have at least E3
            const legalPawnMoves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, pawnPos); // Legal
            (0, chai_1.expect)(legalPawnMoves).to.be.an('array');
            (0, chai_1.expect)(legalPawnMoves).to.have.lengthOf(0, 'Pinned pawn should have no legal moves.');
        });
        it('should allow moves that get the king out of check (move king)', () => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            const whiteKing = new Figure_1.Figure('white', 'king');
            const blackQueen = new Figure_1.Figure('black', 'queen');
            const kingPos = { x: 4, y: 0 }; // E1
            const queenPos = { x: 7, y: 3 }; // H4 (checks E1 diagonally)
            board.place(whiteKing, kingPos);
            board.place(blackQueen, queenPos);
            // King is in check.
            // King can move to D1, D2, E2, F1, F2
            // E1->D1 is illegal (still in check diagonally from H4 if king moves to D1, queen still attacks D1) - No, queen at H4 attacks A1-H8 diagonal. So E1 is on that diagonal.
            // D1, F1 are on the same rank. E2, F2 are not on the same rank.
            // King's pseudo-legal moves are: {x:3, y:0}, {x:5, y:0}, {x:3, y:1}, {x:4, y:1}, {x:5, y:1}
            // Out of these:
            // {x:3, y:0} (D1) is attacked by queen on H4 (same diagonal: D1-H4)
            // {x:5, y:0} (F1) is attacked by queen on H4 (same diagonal: F1-H4)
            // So, only E2 ({x:4, y:1}), D2 ({x:3, y:1}), F2 ({x:5, y:1}) should be legal.
            const legalKingMoves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, kingPos);
            const expectedLegalMoves = [
                { start: kingPos, end: { x: 4, y: 1 } }, // E2
                { start: kingPos, end: { x: 3, y: 1 } }, // D2
                { start: kingPos, end: { x: 5, y: 0 } }, // F1
                { start: kingPos, end: { x: 3, y: 0 } } // D1
            ];
            (0, chai_1.expect)(legalKingMoves.map(m => m.move)).to.have.deep.members(expectedLegalMoves);
            (0, chai_1.expect)(legalKingMoves).to.have.lengthOf(4);
        });
        it('should allow moves that get the king out of check (block attack)', () => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            const whiteKing = new Figure_1.Figure('white', 'king');
            const whiteRook = new Figure_1.Figure('white', 'rook');
            const blackQueen = new Figure_1.Figure('black', 'queen');
            const kingPos = { x: 0, y: 0 }; // A1
            const rookPos = { x: 0, y: 1 }; // A2
            const queenPos = { x: 0, y: 7 }; // A8 (checks king on A1)
            board.place(whiteKing, kingPos);
            board.place(whiteRook, rookPos);
            board.place(blackQueen, queenPos);
            // King is checked by Queen on A8. White Rook on A2 can block.
            // Rook pseudo-legal moves include A3-A7
            const legalRookMoves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, rookPos);
            const expectedBlockMove = { start: rookPos, end: { x: 0, y: 6 } }; // A2 to A7 (blocking A8 Queen)
            (0, chai_1.expect)(legalRookMoves.map(m => m.move)).to.deep.include(expectedBlockMove);
        });
    });
    // Test containsInitialFigure
    describe('containsInitialFigure()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            gameState = ChessEngine_1.ChessEngine.initGame('human', 'human'); // Initial setup
            board = gameState.board;
        });
        it('should return true for a piece on its initial position with empty history', () => {
            const whitePawnPos = { x: 0, y: 1 }; // A2
            const pawn = ChessEngine_1.ChessEngine.getFigure(gameState, whitePawnPos); // Get pawn from initial setup
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['containsInitialFigure'](gameState, whitePawnPos)).to.be.true;
        });
        it('should return false for a position that is now empty but used to hold a piece that moved', () => {
            // Scenario: White pawn at A2 has moved to A3. A2 is now empty.
            board = ChessEngine_1.ChessEngine.initGame('human', 'human').board; // Get initial setup
            const whitePawnA2 = board.getPiece({ x: 0, y: 1 });
            // Simulate the move: A2 -> A3
            board.removePiece({ x: 0, y: 1 });
            board.place(whitePawnA2, { x: 0, y: 2 });
            gameState.moveHistory = [{
                    type: 'move',
                    player: new Player_1.HumanPlayer('white'),
                    board: new Board_1.Board(), // dummy
                    piece: whitePawnA2, // The actual piece object
                    move: { start: { x: 0, y: 1 }, end: { x: 0, y: 2 } },
                    destroyedPiece: null,
                    opponentKingChecked: false,
                }];
            // Now, call containsInitialFigure on the *original* position of A2 (which is now empty)
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['containsInitialFigure'](gameState, { x: 0, y: 1 })).to.be.false;
        });
    });
    // Test isKingChecked
    describe('isKingChecked()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Start with an empty board
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black'); // Opponent is black, so their king is black
        });
        it('should return true if the white king is attacked by an enemy piece', () => {
            const whiteKingPos = { x: 4, y: 0 }; // E1
            const blackRookPos = { x: 4, y: 7 }; // E8
            board.place(new Figure_1.Figure('white', 'king'), whiteKingPos);
            board.place(new Figure_1.Figure('black', 'rook'), blackRookPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'white')).to.be.true;
        });
        it('should return false if the white king is not attacked', () => {
            const whiteKingPos = { x: 4, y: 0 }; // E1
            board.place(new Figure_1.Figure('white', 'king'), whiteKingPos);
            // No opponent pieces on board or attacking
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'white')).to.be.false;
        });
        it('should return true if the black king is attacked by an enemy piece', () => {
            const blackKingPos = { x: 3, y: 7 }; // D8
            const whiteQueenPos = { x: 7, y: 3 }; // H4 (diagonal attack)
            board.place(new Figure_1.Figure('black', 'king'), blackKingPos);
            board.place(new Figure_1.Figure('white', 'queen'), whiteQueenPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'black')).to.be.true;
        });
        it('should return false if the black king is not attacked', () => {
            const blackKingPos = { x: 3, y: 7 }; // D8
            board.place(new Figure_1.Figure('black', 'king'), blackKingPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'black')).to.be.false;
        });
        it('should handle king not found on board', () => {
            // No king placed on board
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'white')).to.be.false;
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'black')).to.be.false;
        });
        it('should return false if attacked by an allied piece', () => {
            const whiteKingPos = { x: 4, y: 0 }; // E1
            const whiteRookPos = { x: 4, y: 1 }; // E2
            board.place(new Figure_1.Figure('white', 'king'), whiteKingPos);
            board.place(new Figure_1.Figure('white', 'rook'), whiteRookPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isKingAttacked(gameState, 'white')).to.be.false;
        });
    });
    // Test findFigures
    describe('findFigures()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Start with empty board
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            // Place some sample pieces
            board.place(new Figure_1.Figure('white', 'king'), { x: 4, y: 0 }); // E1
            board.place(new Figure_1.Figure('white', 'pawn'), { x: 0, y: 1 }); // A2
            board.place(new Figure_1.Figure('white', 'rook'), { x: 7, y: 0 }); // H1
            board.place(new Figure_1.Figure('black', 'king'), { x: 4, y: 7 }); // E8
            board.place(new Figure_1.Figure('black', 'pawn'), { x: 0, y: 6 }); // A7
            board.place(new Figure_1.Figure('black', 'rook'), { x: 7, y: 7 }); // H8
        });
        it('should find all white pawns', () => {
            const whitePawnPos = { x: 0, y: 1 }; // A2
            const pawns = ChessEngine_1.ChessEngine['findFigures'](gameState, ['pawn'], 'white');
            (0, chai_1.expect)(pawns).to.have.lengthOf(1);
            (0, chai_1.expect)(pawns[0]).to.deep.equal(whitePawnPos);
        });
        it('should find all kings regardless of color', () => {
            const kingPositions = ChessEngine_1.ChessEngine['findFigures'](gameState, ['king'], 'both');
            const expectedKingPositions = [{ x: 4, y: 0 }, { x: 4, y: 7 }];
            (0, chai_1.expect)(kingPositions).to.have.deep.members(expectedKingPositions);
            (0, chai_1.expect)(kingPositions).to.have.lengthOf(2);
        });
        it('should find all pieces of a specific color', () => {
            const blackPieces = ChessEngine_1.ChessEngine['findFigures'](gameState, 'all', 'black');
            const expectedBlackPositions = [{ x: 4, y: 7 }, { x: 0, y: 6 }, { x: 7, y: 7 }];
            (0, chai_1.expect)(blackPieces).to.have.deep.members(expectedBlackPositions);
            (0, chai_1.expect)(blackPieces).to.have.lengthOf(3);
        });
        it('should find all pieces on the board', () => {
            const allPieces = ChessEngine_1.ChessEngine['findFigures'](gameState, 'all', 'both');
            const expectedAllPositions = [
                { x: 4, y: 0 }, { x: 0, y: 1 }, { x: 7, y: 0 },
                { x: 4, y: 7 }, { x: 0, y: 6 }, { x: 7, y: 7 }
            ];
            (0, chai_1.expect)(allPieces).to.have.deep.members(expectedAllPositions);
            (0, chai_1.expect)(allPieces).to.have.lengthOf(6);
        });
        it('should return an empty array if no figures match criteria', () => {
            const nonExistentPiece = ChessEngine_1.ChessEngine['findFigures'](gameState, ['queen'], 'white');
            (0, chai_1.expect)(nonExistentPiece).to.be.an('array').and.to.have.lengthOf(0);
        });
    });
    // Test simulateMove
    describe('simulateMove()', () => {
        let gameState;
        let initialKingPos = { x: 4, y: 0 }; // E1
        let moveTargetPos = { x: 5, y: 1 }; // F2
        beforeEach(() => {
            const board = new Board_1.Board();
            board.place(new Figure_1.Figure('white', 'king'), initialKingPos);
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
        });
        it('should return a new GameState object', () => {
            const move = { start: initialKingPos, end: moveTargetPos };
            const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
            (0, chai_1.expect)(newGameState).to.exist;
            (0, chai_1.expect)(newGameState).to.not.equal(gameState); // Not the same object reference
        });
        it('should apply the move to the new GameState board', () => {
            const move = { start: initialKingPos, end: moveTargetPos };
            const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
            (0, chai_1.expect)(newGameState?.board.getPiece(moveTargetPos)?.getPiece()).to.equal('king');
            (0, chai_1.expect)(newGameState?.board.getPiece(initialKingPos)).to.be.null;
        });
        it('should not modify the original GameState', () => {
            const originalBoardGrid = Board_1.Board.cloneGrid(gameState.board.grid, true); // Deep clone
            const move = { start: initialKingPos, end: moveTargetPos };
            ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
            // Verify original board is unchanged
            (0, chai_1.expect)(gameState.board.grid).to.deep.equal(originalBoardGrid);
            (0, chai_1.expect)(gameState.board.getPiece(initialKingPos)?.getPiece()).to.equal('king');
            (0, chai_1.expect)(gameState.board.getPiece(moveTargetPos)).to.be.null;
        });
        it('should return null if the move is not possible (e.g., no piece at start)', () => {
            const invalidMove = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }; // A1 to B2, A1 is empty
            const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, invalidMove);
            (0, chai_1.expect)(newGameState).to.be.null;
        });
    });
    // Test isSquareAttackedBy
    describe('isSquareAttackedBy()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
        });
        it('should return true if the square is attacked by an opponent rook', () => {
            const targetSquare = { x: 3, y: 3 }; // D4
            const attackerPos = { x: 3, y: 0 }; // D1
            board.place(new Figure_1.Figure('black', 'rook'), attackerPos);
            // Place a dummy piece on target square if needed by getMoves (e.g. king check scenario)
            board.place(new Figure_1.Figure('white', 'pawn'), targetSquare); // Placeholder
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isSquareAttackedBy(gameState, targetSquare, 'black')).to.be.true;
        });
        it('should return true if the square is attacked by an opponent knight', () => {
            const targetSquare = { x: 3, y: 3 }; // D4
            const attackerPos = { x: 2, y: 5 }; // C6 (knight attacks D4)
            board.place(new Figure_1.Figure('black', 'knight'), attackerPos);
            board.place(new Figure_1.Figure('white', 'pawn'), targetSquare); // Placeholder
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isSquareAttackedBy(gameState, targetSquare, 'black')).to.be.true;
        });
        it('should return true if the square is attacked by an opponent pawn', () => {
            const targetSquare = { x: 3, y: 3 }; // D4
            const attackerPos = { x: 2, y: 4 }; // C5 (black pawn attacks D4)
            board.place(new Figure_1.Figure('black', 'pawn'), attackerPos);
            board.place(new Figure_1.Figure('white', 'pawn'), targetSquare); // Placeholder
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isSquareAttackedBy(gameState, targetSquare, 'black')).to.be.true;
        });
        it('should return false if the square is not attacked', () => {
            const targetSquare = { x: 3, y: 3 }; // D4
            board.place(new Figure_1.Figure('black', 'pawn'), { x: 0, y: 0 }); // Far away attacker
            board.place(new Figure_1.Figure('white', 'pawn'), targetSquare); // Placeholder
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isSquareAttackedBy(gameState, targetSquare, 'black')).to.be.false;
        });
        it('should return false if attacked by an allied piece', () => {
            const targetSquare = { x: 3, y: 3 }; // D4
            const attackerPos = { x: 3, y: 0 }; // D1
            board.place(new Figure_1.Figure('white', 'rook'), attackerPos); // White rook
            board.place(new Figure_1.Figure('white', 'pawn'), targetSquare); // White pawn (ally)
            (0, chai_1.expect)(ChessEngine_1.ChessEngine.isSquareAttackedBy(gameState, targetSquare, 'white')).to.be.false;
        });
    });
    // Test isOccupied
    describe('isOccupied()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board(); // Empty board
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
        });
        it('should return true if a square is occupied', () => {
            const occupiedPos = { x: 0, y: 0 };
            board.place(new Figure_1.Figure('white', 'pawn'), occupiedPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isOccupied'](gameState, occupiedPos)).to.be.true;
        });
        it('should return false if a square is empty', () => {
            const emptyPos = { x: 0, y: 0 };
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isOccupied'](gameState, emptyPos)).to.be.false;
        });
    });
    // Test getPositionRelativeTo
    describe('getPositionRelativeTo()', () => {
        it('should correctly calculate forward position', () => {
            const startPos = { x: 0, y: 0 }; // A1
            const offset = { x: 1, y: 1 }; // Diagonal
            const result = ChessEngine_1.ChessEngine['getPositionRelativeTo'](startPos, 'forward', offset);
            (0, chai_1.expect)(result).to.deep.equal({ x: 1, y: 1 }); // B2
        });
        it('should correctly calculate backward position', () => {
            const startPos = { x: 7, y: 7 }; // H8
            const offset = { x: 1, y: 1 }; // Diagonal
            const result = ChessEngine_1.ChessEngine['getPositionRelativeTo'](startPos, 'backward', offset);
            (0, chai_1.expect)(result).to.deep.equal({ x: 6, y: 6 }); // G7
        });
        it('should return null if result is out of bounds (positive x)', () => {
            const startPos = { x: 7, y: 0 }; // H1
            const offset = { x: 1, y: 0 };
            const result = ChessEngine_1.ChessEngine['getPositionRelativeTo'](startPos, 'forward', offset);
            (0, chai_1.expect)(result).to.be.null;
        });
        it('should return null if result is out of bounds (negative y)', () => {
            const startPos = { x: 0, y: 0 }; // A1
            const offset = { x: 0, y: 1 }; // Moving backward from A1
            const result = ChessEngine_1.ChessEngine['getPositionRelativeTo'](startPos, 'backward', offset);
            (0, chai_1.expect)(result).to.be.null;
        });
        it('should handle zero offset', () => {
            const startPos = { x: 3, y: 3 }; // D4
            const offset = { x: 0, y: 0 };
            const result = ChessEngine_1.ChessEngine['getPositionRelativeTo'](startPos, 'forward', offset);
            (0, chai_1.expect)(result).to.deep.equal(startPos);
        });
    });
    // Test getMove
    describe('getMove()', () => {
        it('should return a valid Move object for valid positions', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 1, y: 1 };
            const move = ChessEngine_1.ChessEngine['getMove'](start, end);
            (0, chai_1.expect)(move).to.deep.equal({ start: { x: 0, y: 0 }, end: { x: 1, y: 1 } });
        });
        it('should throw an error if start position is out of grid', () => {
            const start = { x: -1, y: 0 };
            const end = { x: 1, y: 1 };
            (0, chai_1.expect)(() => ChessEngine_1.ChessEngine['getMove'](start, end)).to.throw(`Any of the position are out of grid: ${start}, ${end}`);
        });
        it('should throw an error if end position is out of grid', () => {
            const start = { x: 0, y: 0 };
            const end = { x: 8, y: 8 };
            (0, chai_1.expect)(() => ChessEngine_1.ChessEngine['getMove'](start, end)).to.throw(`Any of the position are out of grid: ${start}, ${end}`);
        });
    });
    // Test getDestroyedPiece
    describe('getDestroyedPiece()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
        });
        it('should return the destroyed piece if an enemy piece is at the end position', () => {
            const attackerPiece = new Figure_1.Figure('white', 'knight');
            const destroyedPiece = new Figure_1.Figure('black', 'pawn');
            const move = { start: { x: 1, y: 1 }, end: { x: 2, y: 3 } }; // Knight from B2 captures pawn at C4
            board.place(attackerPiece, move.start);
            board.place(destroyedPiece, move.end);
            const result = ChessEngine_1.ChessEngine['getDestroyedPiece'](gameState, attackerPiece, move);
            (0, chai_1.expect)(result).to.deep.equal(destroyedPiece); // Deep equal for object content
            (0, chai_1.expect)(result).to.equal(destroyedPiece); // Strict equal for instance
        });
        it('should return null if no piece is at the end position', () => {
            const attackerPiece = new Figure_1.Figure('white', 'knight');
            const move = { start: { x: 1, y: 1 }, end: { x: 2, y: 3 } }; // Knight to empty square
            board.place(attackerPiece, move.start);
            const result = ChessEngine_1.ChessEngine['getDestroyedPiece'](gameState, attackerPiece, move);
            (0, chai_1.expect)(result).to.be.null;
        });
        it('should return null if an allied piece is at the end position', () => {
            const attackerPiece = new Figure_1.Figure('white', 'knight');
            const alliedPiece = new Figure_1.Figure('white', 'pawn');
            const move = { start: { x: 1, y: 1 }, end: { x: 2, y: 3 } }; // Knight to square with ally
            board.place(attackerPiece, move.start);
            board.place(alliedPiece, move.end);
            const result = ChessEngine_1.ChessEngine['getDestroyedPiece'](gameState, attackerPiece, move);
            (0, chai_1.expect)(result).to.be.null;
        });
        it('should return null if the attacker piece itself is null', () => {
            const attackerPiece = null; // Invalid attacker
            const destroyedPiece = new Figure_1.Figure('black', 'pawn');
            const move = { start: { x: 1, y: 1 }, end: { x: 2, y: 3 } };
            board.place(destroyedPiece, move.end);
            const result = ChessEngine_1.ChessEngine['getDestroyedPiece'](gameState, attackerPiece, move);
            (0, chai_1.expect)(result).to.be.null;
        });
    });
    // Test isPieceOnEndOfBoard
    describe('isPieceOnEndOfBoard()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white'); // Assuming white player for 'forward' direction
        });
        it('should return true for a white pawn on the 8th rank (y=7)', () => {
            const whitePawnPos = { x: 0, y: 7 }; // A8
            board.place(new Figure_1.Figure('white', 'pawn'), whitePawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isPieceOnEndOfBoard'](gameState, whitePawnPos)).to.be.true;
        });
        it('should return true for a black pawn on the 1st rank (y=0)', () => {
            // Need to adjust gameState.player so 'backward' is relative to black
            gameState.opponent = new Player_1.HumanPlayer('black');
            const blackPawnPos = { x: 0, y: 0 }; // A1
            board.place(new Figure_1.Figure('black', 'pawn'), blackPawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isPieceOnEndOfBoard'](gameState, blackPawnPos)).to.be.true;
        });
        it('should return false for a white pawn not on the 8th rank', () => {
            const whitePawnPos = { x: 0, y: 6 }; // A7
            board.place(new Figure_1.Figure('white', 'pawn'), whitePawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isPieceOnEndOfBoard'](gameState, whitePawnPos)).to.be.false;
        });
        it('should return false for a black pawn not on the 1st rank', () => {
            gameState.player = new Player_1.HumanPlayer('black');
            const blackPawnPos = { x: 0, y: 1 }; // A2
            board.place(new Figure_1.Figure('black', 'pawn'), blackPawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isPieceOnEndOfBoard'](gameState, blackPawnPos)).to.be.false;
        });
        it('should return false if no piece is at the position', () => {
            const emptyPos = { x: 0, y: 7 };
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isPieceOnEndOfBoard'](gameState, emptyPos)).to.be.false;
        });
    });
    // Test getPiecePosition
    describe('getPiecePosition()', () => {
        let gameState;
        let board;
        const testPiece = new Figure_1.Figure('white', 'knight');
        const testPos = { x: 3, y: 4 }; // D5
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            board.place(testPiece, testPos);
        });
        it('should return the correct position of the piece', () => {
            const foundPos = ChessEngine_1.ChessEngine['getPiecePosition'](gameState, testPiece);
            (0, chai_1.expect)(foundPos).to.deep.equal(testPos);
        });
        it('should return null if the piece is not on the board', () => {
            const absentPiece = new Figure_1.Figure('black', 'queen'); // Not placed on board
            const foundPos = ChessEngine_1.ChessEngine['getPiecePosition'](gameState, absentPiece);
            (0, chai_1.expect)(foundPos).to.be.null;
        });
        it('should return null if the board is empty', () => {
            board = new Board_1.Board(); // Empty board
            gameState.board = board;
            const foundPos = ChessEngine_1.ChessEngine['getPiecePosition'](gameState, testPiece);
            (0, chai_1.expect)(foundPos).to.be.null;
        });
    });
    // Test getDirection
    describe('getDirection()', () => {
        let gameState;
        beforeEach(() => {
            gameState = (0, HelperTestFunctions_1.createTestGameState)(new Board_1.Board().grid); // Use a dummy board
        });
        it('should return "forward" if piece color matches player color', () => {
            gameState.player = new Player_1.HumanPlayer('white');
            const whitePiece = new Figure_1.Figure('white', 'pawn');
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['getDirection'](gameState, whitePiece)).to.equal('forward');
        });
        it('should return "backward" if piece color matches opponent color', () => {
            gameState.player = new Player_1.HumanPlayer('white');
            const blackPiece = new Figure_1.Figure('black', 'pawn');
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['getDirection'](gameState, blackPiece)).to.equal('backward');
        });
        it('should return "forward" if player is black and piece is black', () => {
            gameState.player = new Player_1.HumanPlayer('black');
            const blackPiece = new Figure_1.Figure('black', 'pawn');
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['getDirection'](gameState, blackPiece)).to.equal('forward');
        });
        it('should return "backward" if player is black and piece is white', () => {
            gameState.player = new Player_1.HumanPlayer('black');
            const whitePiece = new Figure_1.Figure('white', 'pawn');
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['getDirection'](gameState, whitePiece)).to.equal('backward');
        });
    });
    // Test onInitPosition
    describe('onInitPosition()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            board = new Board_1.Board();
            // Initialize gameState with the standard setup for checking initial positions
            gameState = ChessEngine_1.ChessEngine.initGame('human', 'human');
        });
        it('should return true for a white pawn on its initial position (A2)', () => {
            const pos = { x: 0, y: 1 }; // A2
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, pos)).to.be.true;
        });
        it('should return true for a black rook on its initial position (H8)', () => {
            const pos = { x: 7, y: 7 }; // H8
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, pos)).to.be.true;
        });
        it('should return false for an empty square', () => {
            const pos = { x: 3, y: 3 }; // D4 (empty)
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, pos)).to.be.false;
        });
        it('should return false if the piece has moved from its initial position', () => {
            const originalPawnPos = { x: 0, y: 1 }; // A2
            const movedPawnPos = { x: 0, y: 2 }; // A3
            const pawn = ChessEngine_1.ChessEngine.getFigure(gameState, originalPawnPos);
            gameState.board.removePiece(originalPawnPos);
            gameState.board.place(pawn, movedPawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, originalPawnPos)).to.be.false; // Original square now empty
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, movedPawnPos)).to.be.false; // Moved piece is not on *its* initial spot
        });
        it('should return false if a different piece is on an initial position', () => {
            const pawnPos = { x: 0, y: 1 }; // A2
            gameState.board.removePiece(pawnPos); // Remove white pawn
            gameState.board.place(new Figure_1.Figure('black', 'knight'), pawnPos); // Place black knight
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, pawnPos)).to.be.false;
        });
        it('should return false for out of grid positions', () => {
            const pos = { x: 8, y: 8 };
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['onInitPosition'](gameState, pos)).to.be.false;
        });
    });
    // Test isFirstMove
    describe('isFirstMove()', () => {
        let gameState;
        let board;
        beforeEach(() => {
            gameState = ChessEngine_1.ChessEngine.initGame('human', 'human'); // Initial setup for containsInitialFigure
            board = gameState.board;
        });
        it('should return true for a piece on its initial position with no history of its moves', () => {
            const whitePawnPos = { x: 0, y: 1 }; // A2
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isFirstMove'](gameState, whitePawnPos)).to.be.true;
        });
        it('should return false for a piece on its initial position that has moved (in history)', () => {
            const whitePawnPos = { x: 0, y: 1 }; // A2
            const pawn = ChessEngine_1.ChessEngine.getFigure(gameState, whitePawnPos);
            // Simulate the pawn moving and returning to its original spot
            gameState.moveHistory.push({
                type: 'move',
                player: new Player_1.HumanPlayer('white'),
                board: new Board_1.Board(), // dummy
                piece: pawn,
                move: { start: whitePawnPos, end: { x: 0, y: 2 } },
                destroyedPiece: null,
                opponentKingChecked: false,
            });
            // After adding history, it should no longer be considered "first move"
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isFirstMove'](gameState, whitePawnPos)).to.be.false;
        });
        it('should return false for a piece not on its initial position', () => {
            const whitePawnPos = { x: 0, y: 1 }; // A2
            const movedPawnPos = { x: 0, y: 3 }; // A4
            const pawn = ChessEngine_1.ChessEngine.getFigure(gameState, whitePawnPos);
            board.removePiece(whitePawnPos);
            board.place(pawn, movedPawnPos);
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isFirstMove'](gameState, movedPawnPos)).to.be.false; // Not on initial pos
        });
        it('should return false if the position is empty', () => {
            const emptyPos = { x: 3, y: 3 }; // D4
            (0, chai_1.expect)(ChessEngine_1.ChessEngine['isFirstMove'](gameState, emptyPos)).to.be.false;
        });
    });
    // Test getFigure
    describe('getFigure()', () => {
        let gameState;
        let board;
        const testPiece = new Figure_1.Figure('white', 'pawn');
        const testPos = { x: 3, y: 3 }; // D4
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            board.place(testPiece, testPos);
        });
        it('should return the Figure object at the specified position', () => {
            const figure = ChessEngine_1.ChessEngine.getFigure(gameState, testPos);
            (0, chai_1.expect)(figure).to.equal(testPiece); // Strict equality for same instance
        });
        it('should return null if no piece is at the specified position', () => {
            const emptyPos = { x: 0, y: 0 };
            const figure = ChessEngine_1.ChessEngine.getFigure(gameState, emptyPos);
            (0, chai_1.expect)(figure).to.be.null;
        });
        it('should return null for out of bounds positions (handled by Board.getPiece)', () => {
            // The `Board.getPiece` method should handle this, which `ChessEngine.getFigure` calls.
            // Assuming Board.getPiece returns null for out of bounds.
            const outOfBoundsPos = { x: 8, y: 8 };
            const figure = ChessEngine_1.ChessEngine.getFigure(gameState, outOfBoundsPos);
            (0, chai_1.expect)(figure).to.be.null;
        });
    });
    // Test buildHistoryEntry
    describe('buildHistoryEntry()', () => {
        let gameState;
        let board;
        let whitePawn;
        let blackRook;
        let startPos;
        let endPos;
        let destroyedPiece;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            whitePawn = new Figure_1.Figure('white', 'pawn');
            blackRook = new Figure_1.Figure('black', 'rook');
            startPos = { x: 1, y: 1 }; // B2
            endPos = { x: 1, y: 2 }; // B3
            destroyedPiece = null;
            board.place(whitePawn, startPos);
        });
        it('should build a "move" history entry correctly', () => {
            const move = { start: startPos, end: endPos };
            const entry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, move, destroyedPiece, 'move');
            (0, chai_1.expect)(entry).to.exist;
            (0, chai_1.expect)(entry?.type).to.equal('move');
            (0, chai_1.expect)(entry?.player.getColor()).to.equal('white');
            (0, chai_1.expect)(entry?.piece).to.equal(whitePawn);
            (0, chai_1.expect)(entry?.move).to.deep.equal(move);
            (0, chai_1.expect)(entry?.destroyedPiece).to.be.null;
            (0, chai_1.expect)(entry?.board).to.be.an.instanceOf(Board_1.Board);
            (0, chai_1.expect)(entry?.board.grid).to.deep.equal(gameState.board.grid); // Should clone the board state
        });
        it('should build an "attackMove" history entry with destroyed piece', () => {
            const attackEndPos = { x: 1, y: 6 }; // B7
            const attackMove = { start: startPos, end: attackEndPos };
            board.place(blackRook, attackEndPos);
            destroyedPiece = blackRook;
            const entry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, attackMove, destroyedPiece, 'attackMove');
            (0, chai_1.expect)(entry?.type).to.equal('attackMove');
            (0, chai_1.expect)(entry?.destroyedPiece).to.equal(destroyedPiece);
        });
        it('should return null if no piece exists at the start position', () => {
            const emptyStartPos = { x: 7, y: 7 }; // H8, empty
            const move = { start: emptyStartPos, end: { x: 6, y: 6 } };
            const entry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, move, null, 'move');
            (0, chai_1.expect)(entry).to.be.null;
        });
        it('should build a "castling" history entry correctly (kingside white)', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const rookPos = { x: 7, y: 0 }; // H1
            const king = new Figure_1.Figure('white', 'king');
            const rook = new Figure_1.Figure('white', 'rook');
            board.removePiece(startPos); // Remove pawn
            board.place(king, kingPos);
            board.place(rook, rookPos);
            const castlingMove = { start: kingPos, end: { x: 6, y: 0 } }; // E1 to G1 (kingside)
            const entry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, castlingMove, null, 'castling');
            (0, chai_1.expect)(entry).to.exist;
            (0, chai_1.expect)(entry?.type).to.equal('castling');
            (0, chai_1.expect)(entry?.player.getColor()).to.equal('white');
            (0, chai_1.expect)(entry?.piece).to.equal(king);
            (0, chai_1.expect)(entry?.move).to.deep.equal(castlingMove);
            (0, chai_1.expect)(entry?.destroyedPiece).to.be.null;
            (0, chai_1.expect)(entry?.board).to.be.an.instanceOf(Board_1.Board);
            // Castling specific properties
            const castlingEntry = entry; // Assert type for access
            (0, chai_1.expect)(castlingEntry.rookPiece).to.exist;
            (0, chai_1.expect)(castlingEntry.rookPiece?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(castlingEntry.rookMove).to.deep.equal({ start: rookPos, end: { x: 5, y: 0 } }); // H1 to F1
        });
        it('should build a "castling" history entry correctly (queenside black)', () => {
            const kingPos = { x: 4, y: 7 }; // E8
            const rookPos = { x: 0, y: 7 }; // A8
            const king = new Figure_1.Figure('black', 'king');
            const rook = new Figure_1.Figure('black', 'rook');
            board.removePiece(startPos); // Remove pawn
            board.place(king, kingPos);
            board.place(rook, rookPos);
            board.display();
            gameState.opponent = new Player_1.HumanPlayer('black'); // Black is current player
            const castlingMove = { start: kingPos, end: { x: 2, y: 7 } }; // E8 to C8 (queenside)
            const entry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, castlingMove, null, 'castling');
            (0, chai_1.expect)(entry).to.exist;
            (0, chai_1.expect)(entry?.type).to.equal('castling');
            (0, chai_1.expect)(entry?.player.getColor()).to.equal('black');
            (0, chai_1.expect)(entry?.piece).to.equal(king);
            (0, chai_1.expect)(entry?.move).to.deep.equal(castlingMove);
            (0, chai_1.expect)(entry?.destroyedPiece).to.be.null;
            (0, chai_1.expect)(entry?.board).to.be.an.instanceOf(Board_1.Board);
            // Castling specific properties
            const castlingEntry = entry;
            (0, chai_1.expect)(castlingEntry.rookPiece).to.exist;
            (0, chai_1.expect)(castlingEntry.rookPiece?.getPiece()).to.equal('rook');
            (0, chai_1.expect)(castlingEntry.rookMove).to.deep.equal({ start: rookPos, end: { x: 3, y: 7 } }); // A8 to D8
        });
        it('should throw an error for castling if rook not found at expected position', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const king = new Figure_1.Figure('white', 'king');
            board.removePiece(startPos); // Remove pawn
            board.place(king, kingPos);
            // Don't place rook at H1
            const castlingMove = { start: kingPos, end: { x: 6, y: 0 } }; // E1 to G1 (kingside)
            (0, chai_1.expect)(() => ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, castlingMove, null, 'castling')).to.throw('Rook not found');
        });
    });
    // Test applyMove
    describe('applyMove()', () => {
        let gameState;
        let board;
        let whitePawn;
        let blackRook;
        let startPos;
        let endPos;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            whitePawn = new Figure_1.Figure('white', 'pawn');
            blackRook = new Figure_1.Figure('black', 'rook');
            startPos = { x: 1, y: 1 }; // B2
            endPos = { x: 1, y: 2 }; // B3
            board.place(whitePawn, startPos);
        });
        it('should successfully apply a valid move and update board and history', () => {
            const move = { start: startPos, end: endPos };
            // Mock validateMove to return a valid HistoryEntry for this test
            const mockHistoryEntry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, move, null, 'move');
            // Temporarily override validateMove
            const originalValidateMove = ChessEngine_1.ChessEngine['validateMove'];
            ChessEngine_1.ChessEngine['validateMove'] = (gs, mv) => {
                if ((0, HelperFunctions_1.isSameMove)(mv, move))
                    return mockHistoryEntry;
                return null;
            };
            const success = ChessEngine_1.ChessEngine.applyMove(gameState, move);
            (0, chai_1.expect)(success).to.be.true;
            (0, chai_1.expect)(gameState.board.getPiece(endPos)).to.equal(whitePawn);
            (0, chai_1.expect)(gameState.board.getPiece(startPos)).to.be.null;
            (0, chai_1.expect)(gameState.moveHistory).to.have.lengthOf(1);
            (0, chai_1.expect)(gameState.moveHistory[0]).to.deep.equal(mockHistoryEntry);
            // Restore original validateMove
            ChessEngine_1.ChessEngine['validateMove'] = originalValidateMove;
        });
        it('should successfully apply a valid attackMove and remove destroyed piece', () => {
            const attackEndPos = { x: 1, y: 6 }; // B7
            const attackMove = { start: startPos, end: attackEndPos };
            board.place(blackRook, attackEndPos);
            // Mock validateMove to return a valid HistoryEntry for this test
            const mockHistoryEntry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, attackMove, blackRook, 'attackMove');
            // Temporarily override validateMove
            const originalValidateMove = ChessEngine_1.ChessEngine['validateMove'];
            ChessEngine_1.ChessEngine['validateMove'] = (gs, mv) => {
                if ((0, HelperFunctions_1.isSameMove)(mv, attackMove))
                    return mockHistoryEntry;
                return null;
            };
            const success = ChessEngine_1.ChessEngine.applyMove(gameState, attackMove);
            (0, chai_1.expect)(success).to.be.true;
            (0, chai_1.expect)(gameState.board.getPiece(attackEndPos)).to.equal(whitePawn); // Attacker should be there
            (0, chai_1.expect)(gameState.board.getPiece(startPos)).to.be.null;
            (0, chai_1.expect)(gameState.moveHistory).to.have.lengthOf(1);
            (0, chai_1.expect)(gameState.moveHistory[0]).to.deep.equal(mockHistoryEntry);
            // Verify destroyed piece is gone from the board
            (0, chai_1.expect)(board.getPiece(attackEndPos)).to.equal(whitePawn); // New piece is there
            (0, chai_1.expect)(board.getPiece(startPos)).to.be.null; // Old piece pos is empty
            // Restore original validateMove
            ChessEngine_1.ChessEngine['validateMove'] = originalValidateMove;
        });
        it('should return false if the move is invalid (validateMove returns null)', () => {
            const invalidMove = { start: startPos, end: { x: 0, y: 0 } }; // Invalid move for pawn
            // Mock validateMove to return null
            const originalValidateMove = ChessEngine_1.ChessEngine['validateMove'];
            ChessEngine_1.ChessEngine['validateMove'] = (gs, mv) => null;
            const success = ChessEngine_1.ChessEngine.applyMove(gameState, invalidMove);
            (0, chai_1.expect)(success).to.be.false;
            // Board and history should be unchanged
            (0, chai_1.expect)(gameState.board.getPiece(startPos)).to.equal(whitePawn);
            (0, chai_1.expect)(gameState.board.getPiece(invalidMove.end)).to.be.null;
            (0, chai_1.expect)(gameState.moveHistory).to.have.lengthOf(0);
            // Restore original validateMove
            ChessEngine_1.ChessEngine['validateMove'] = originalValidateMove;
        });
    });
    // Test move (public)
    describe('move()', () => {
        let gameState;
        let board;
        let whitePawn;
        let startPos;
        let endPos;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            whitePawn = new Figure_1.Figure('white', 'pawn');
            startPos = { x: 1, y: 1 }; // B2
            endPos = { x: 1, y: 2 }; // B3
            board.place(whitePawn, startPos);
        });
        it('should successfully apply a valid move without throwing', () => {
            const move = { start: startPos, end: endPos };
            const mockHistoryEntry = ChessEngine_1.ChessEngine['buildHistoryEntry'](gameState, move, null, 'move');
            const originalValidateMove = ChessEngine_1.ChessEngine['validateMove'];
            ChessEngine_1.ChessEngine['validateMove'] = (gs, mv) => {
                if ((0, HelperFunctions_1.isSameMove)(mv, move))
                    return mockHistoryEntry;
                return null;
            };
            (0, chai_1.expect)(() => ChessEngine_1.ChessEngine.move(gameState, move)).to.not.throw();
            (0, chai_1.expect)(gameState.board.getPiece(endPos)).to.equal(whitePawn);
            (0, chai_1.expect)(gameState.moveHistory).to.have.lengthOf(1);
            ChessEngine_1.ChessEngine['validateMove'] = originalValidateMove;
        });
        it('should throw an error for an illegible move', () => {
            const invalidMove = { start: startPos, end: { x: 0, y: 0 } }; // Invalid move
            // Mock validateMove to return null, making the move invalid
            const originalValidateMove = ChessEngine_1.ChessEngine['validateMove'];
            ChessEngine_1.ChessEngine['validateMove'] = (gs, mv) => null;
            (0, chai_1.expect)(() => ChessEngine_1.ChessEngine.move(gameState, invalidMove)).to.throw(`Move ${invalidMove} is illegible`);
            ChessEngine_1.ChessEngine['validateMove'] = originalValidateMove;
        });
    });
    // Test validateMove
    describe('validateMove()', () => {
        let gameState;
        let board;
        let whiteKing;
        let whitePawn;
        let blackRook;
        beforeEach(() => {
            board = new Board_1.Board();
            gameState = (0, HelperTestFunctions_1.createTestGameState)(board.grid);
            gameState.player = new Player_1.HumanPlayer('white');
            gameState.opponent = new Player_1.ComputerPlayer('black');
            whiteKing = new Figure_1.Figure('white', 'king');
            whitePawn = new Figure_1.Figure('white', 'pawn');
            blackRook = new Figure_1.Figure('black', 'rook');
        });
        it('should return HistoryEntry for a legal move that does not result in king check', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const pawnPos = { x: 0, y: 1 }; // A2
            board.place(whiteKing, kingPos);
            board.place(whitePawn, pawnPos);
            const move = { start: pawnPos, end: { x: 0, y: 2 } }; // A2 to A3
            // Mock getMoves to return this pseudo-legal move
            const originalGetMoves = ChessEngine_1.ChessEngine.getMoves;
            ChessEngine_1.ChessEngine.getMoves = (gs, pos) => {
                if ((0, HelperFunctions_1.isSamePos)(pos, pawnPos)) {
                    return [ChessEngine_1.ChessEngine['buildHistoryEntry'](gs, move, null, 'move')];
                }
                return [];
            };
            // Mock isKingCheckedAfterMove to return false (no check)
            const originalIsKingCheckedAfterMove = ChessEngine_1.ChessEngine['isKingCheckedAfterMove'];
            ChessEngine_1.ChessEngine['isKingCheckedAfterMove'] = (gs, color, mv) => false;
            const result = ChessEngine_1.ChessEngine['validateMove'](gameState, move);
            (0, chai_1.expect)(result).to.not.be.null;
            (0, chai_1.expect)(result?.move).to.deep.equal(move);
            (0, chai_1.expect)(result?.type).to.equal('move');
            ChessEngine_1.ChessEngine.getMoves = originalGetMoves;
            ChessEngine_1.ChessEngine['isKingCheckedAfterMove'] = originalIsKingCheckedAfterMove;
        });
        it('should return null if the move is not pseudo-legal', () => {
            const pawnPos = { x: 0, y: 1 }; // A2
            board.place(whitePawn, pawnPos);
            const invalidMove = { start: pawnPos, end: { x: 5, y: 5 } }; // Not a pawn move
            // Mock getMoves to NOT return this invalid move
            const originalGetMoves = ChessEngine_1.ChessEngine.getMoves;
            ChessEngine_1.ChessEngine.getMoves = (gs, pos) => {
                if ((0, HelperFunctions_1.isSamePos)(pos, pawnPos)) {
                    return [ChessEngine_1.ChessEngine['buildHistoryEntry'](gs, { start: pawnPos, end: { x: 0, y: 2 } }, null, 'move')]; // Only include valid pawn moves
                }
                return [];
            };
            const result = ChessEngine_1.ChessEngine['validateMove'](gameState, invalidMove);
            (0, chai_1.expect)(result).to.be.null;
            ChessEngine_1.ChessEngine.getMoves = originalGetMoves;
        });
        it('should return null if the move leaves the king in check', () => {
            const kingPos = { x: 4, y: 0 }; // E1
            const pawnPos = { x: 4, y: 1 }; // E2 (pinned pawn)
            const blackRookPos = { x: 4, y: 7 }; // E8 (attacker)
            board.place(whiteKing, kingPos);
            board.place(whitePawn, pawnPos);
            board.place(blackRook, blackRookPos);
            const move = { start: pawnPos, end: { x: 4, y: 2 } }; // E2 to E3 (exposes king)
            // Mock getMoves to return this pseudo-legal move
            const originalGetMoves = ChessEngine_1.ChessEngine.getMoves;
            ChessEngine_1.ChessEngine.getMoves = (gs, pos) => {
                if ((0, HelperFunctions_1.isSamePos)(pos, pawnPos)) {
                    return [ChessEngine_1.ChessEngine['buildHistoryEntry'](gs, move, null, 'move')];
                }
                return [];
            };
            // Mock isKingCheckedAfterMove to return true (king is checked after this move)
            const originalIsKingCheckedAfterMove = ChessEngine_1.ChessEngine['isKingCheckedAfterMove'];
            ChessEngine_1.ChessEngine['isKingCheckedAfterMove'] = (gs, color, mv) => {
                return (0, HelperFunctions_1.isSameMove)(mv, move); // This specific move causes check
            };
            const result = ChessEngine_1.ChessEngine['validateMove'](gameState, move);
            (0, chai_1.expect)(result).to.be.null;
            ChessEngine_1.ChessEngine.getMoves = originalGetMoves;
            ChessEngine_1.ChessEngine['isKingCheckedAfterMove'] = originalIsKingCheckedAfterMove;
        });
    });
});
//# sourceMappingURL=ChessEngine.moves.test.js.map