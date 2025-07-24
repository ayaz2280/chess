"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Board_1 = require("../../src/ChessClass/Board");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const HelperTestFunctions_1 = require("../HelperTestFunctions");
describe('isKingAttacked()', () => {
    let gameState;
    let board;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
    });
    it('should return true for white rook directly attacking black king on whites turn', () => {
        board = new Board_1.Board();
        board.place(new Figure_1.Figure('white', 'rook'), (0, HelperFunctions_1.parseAlgNotation)('e1'));
        board.place(new Figure_1.Figure('black', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e8'));
        gameState.board = board;
        const isAttacked = ChessEngine_1.ChessEngine['isKingAttacked'](gameState, 'black');
        (0, chai_1.expect)(isAttacked).to.equal(true);
    });
    it('should return false for black king being blocked from whites rooks attack', () => {
        board = new Board_1.Board();
        board.place(new Figure_1.Figure('white', 'rook'), (0, HelperFunctions_1.parseAlgNotation)('e1'));
        board.place(new Figure_1.Figure('black', 'knight'), (0, HelperFunctions_1.parseAlgNotation)('e7'));
        board.place(new Figure_1.Figure('black', 'king'), (0, HelperFunctions_1.parseAlgNotation)('e8'));
        gameState.board = board;
        const isAttacked = ChessEngine_1.ChessEngine['isKingAttacked'](gameState, 'black');
        (0, chai_1.expect)(isAttacked).to.equal(false);
    });
});
//# sourceMappingURL=isKingAttacked.test.js.map