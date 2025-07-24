"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const HelperTestFunctions_1 = require("../HelperTestFunctions");
const chai_1 = require("chai");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
describe('applyMove()', () => {
    let gameState;
    let board;
    let entries;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
        board = gameState.board;
        entries = gameState.moveHistory;
    });
    it('should apply pawn first move correctly', () => {
        const move = (0, HelperFunctions_1.parseMove)('a2-a4');
        const success = ChessEngine_1.ChessEngine['applyMove'](gameState, move);
        (0, console_1.assert)(true === success);
        (0, chai_1.expect)(entries).to.have.lengthOf(1);
        (0, chai_1.expect)(entries[entries.length - 1].move).to.deep.equal(move);
        (0, chai_1.expect)(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a2'))).to.equal(null);
        (0, chai_1.expect)(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a4'))).to.deep.equal(new Figure_1.Figure('white', 'pawn'));
    });
    it('shouldnt apply illegal pawn move', () => {
        const move = (0, HelperFunctions_1.parseMove)('a2-a5');
        const success = ChessEngine_1.ChessEngine['applyMove'](gameState, move);
        (0, console_1.assert)(false === success);
        (0, chai_1.expect)(entries).to.have.lengthOf(0);
        (0, chai_1.expect)(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a2'))).to.deep.equal(new Figure_1.Figure('white', 'pawn'));
        (0, chai_1.expect)(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a5'))).to.deep.equal(null);
    });
});
//# sourceMappingURL=applyMove.test.js.map