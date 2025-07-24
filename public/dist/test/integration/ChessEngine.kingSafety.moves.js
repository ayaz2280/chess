"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Board_1 = require("../../src/ChessClass/Board");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const Player_1 = require("../../src/ChessClass/Player");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
const HelperFunctions_2 = require("../../src/ChessClass/HelperFunctions");
const HelperTestFunctions_1 = require("../HelperTestFunctions");
Error.stackTraceLimit = 5;
// Test getMoves
describe('getMoves()', () => {
    let gameState;
    let board;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
        gameState.player = new Player_1.HumanPlayer('white');
    });
});
describe('getLegalMoves()', () => {
    let gameState;
    let board;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
        gameState.player = new Player_1.HumanPlayer('white');
    });
    it('should return 5 legal moves (no enemies, 1 king)', () => {
        board = new Board_1.Board();
        gameState.board = board;
        board.place(new Figure_1.Figure('white', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e1'));
        // board.place(new Figure('white','rook'), parseAlgNotation('h1'));
        //board.place(new Figure('black','king'), parseAlgNotation('e8'));
        const moves = ChessEngine_1.ChessEngine.getMoves(gameState, (0, HelperFunctions_1.parseAlgNotation)('e1')).map(e => e.move);
        const expectedMoves = [
            (0, HelperFunctions_2.parseMove)('e1-d1'),
            (0, HelperFunctions_2.parseMove)('e1-d2'),
            (0, HelperFunctions_2.parseMove)('e1-e2'),
            (0, HelperFunctions_2.parseMove)('e1-f2'),
            (0, HelperFunctions_2.parseMove)('e1-f1'),
        ];
        (0, chai_1.expect)(moves).to.have.deep.members(expectedMoves);
    });
    it('should return 5 legal moves (1 enemy king on init position)', () => {
        board = new Board_1.Board();
        gameState.board = board;
        board.place(new Figure_1.Figure('white', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e1'));
        // board.place(new Figure('white','rook'), parseAlgNotation('h1'));
        board.place(new Figure_1.Figure('black', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e8'));
        const entries = ChessEngine_1.ChessEngine.getMoves(gameState, (0, HelperFunctions_1.parseAlgNotation)('e1'));
        const moves = entries.map(e => e.move);
        const expectedMoves = [
            (0, HelperFunctions_2.parseMove)('e1-d1'),
            (0, HelperFunctions_2.parseMove)('e1-d2'),
            (0, HelperFunctions_2.parseMove)('e1-e2'),
            (0, HelperFunctions_2.parseMove)('e1-f2'),
            (0, HelperFunctions_2.parseMove)('e1-f1'),
        ];
        (0, chai_1.expect)(moves).to.have.deep.members(expectedMoves);
    });
    it('should return 0 king moves for start setup', () => {
        const kingPos = ChessEngine_1.ChessEngine['findFigures'](gameState, ['king'], 'white')[0];
        const moves = ChessEngine_1.ChessEngine['getMoves'](gameState, kingPos);
        (0, chai_1.expect)(moves).to.be.empty;
    });
    it('should return 3 legal moves', () => {
        board = new Board_1.Board();
        board.place(new Figure_1.Figure('white', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e1'));
        board.place(new Figure_1.Figure('black', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e8'));
        board.place(new Figure_1.Figure('black', 'rook'), (0, HelperFunctions_1.parseAlgNotation)('d7'));
        gameState.board = board;
        const legalKingMoves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, (0, HelperFunctions_1.parseAlgNotation)('e1')).map(e => e.move);
        const expectedMoves = [
            (0, HelperFunctions_2.parseMove)('e1-e2'),
            (0, HelperFunctions_2.parseMove)('e1-f2'),
            (0, HelperFunctions_2.parseMove)('e1-f1'),
        ];
        console.log(legalKingMoves);
        (0, chai_1.expect)(legalKingMoves).to.have.lengthOf(expectedMoves.length);
        (0, chai_1.expect)(legalKingMoves).to.have.deep.members(expectedMoves);
    });
});
//# sourceMappingURL=ChessEngine.kingSafety.moves.js.map