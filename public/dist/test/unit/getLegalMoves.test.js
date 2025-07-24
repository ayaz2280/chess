"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const HelperTestFunctions_1 = require("../HelperTestFunctions");
const chai_1 = require("chai");
describe('applyMove()', () => {
    let gameState;
    let board;
    let entries;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
        board = gameState.board;
        entries = gameState.moveHistory;
    });
    it('should return 2 legal moves for white pawn', () => {
        const moves = ChessEngine_1.ChessEngine['getLegalMoves'](gameState, (0, HelperFunctions_1.parseAlgNotation)('a2'));
        const expectedMoves = [
            (0, HelperFunctions_1.parseMove)('a2-a3'),
            (0, HelperFunctions_1.parseMove)('a2-a4'),
        ];
        (0, chai_1.expect)(moves.map(e => e.move)).to.have.deep.members(expectedMoves);
    });
    it('should return 2 legal moves for black pawn (one square and en passant)', () => {
        ChessEngine_1.ChessEngine.applyMove(gameState, (0, HelperFunctions_1.parseMove)('h2-h3'));
        ChessEngine_1.ChessEngine.applyMove(gameState, (0, HelperFunctions_1.parseMove)('a7-a5'));
        ChessEngine_1.ChessEngine.applyMove(gameState, (0, HelperFunctions_1.parseMove)('h3-h4'));
        ChessEngine_1.ChessEngine.applyMove(gameState, (0, HelperFunctions_1.parseMove)('a5-a4'));
        ChessEngine_1.ChessEngine.applyMove(gameState, (0, HelperFunctions_1.parseMove)('b2-b4'));
        const moves = ChessEngine_1.ChessEngine['getLegalMoves'](gameState, (0, HelperFunctions_1.parseAlgNotation)('a4'));
        const expectedMoves = [
            (0, HelperFunctions_1.parseMove)('a4-a3'),
            (0, HelperFunctions_1.parseMove)('a4-b3'),
        ];
        board.display();
        console.log(expectedMoves);
        (0, HelperTestFunctions_1.printEntries)(moves);
        (0, chai_1.expect)(moves.map(e => e.move)).to.have.deep.members(expectedMoves);
    });
});
//# sourceMappingURL=getLegalMoves.test.js.map