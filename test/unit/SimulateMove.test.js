"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ChessEngine_1 = require("../../src/ChessClass/ChessEngine");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
const HelperTestFunctions_1 = require("../HelperTestFunctions");
Error.stackTraceLimit = 5;
describe('simulateMove()', () => {
    let gameState;
    let board;
    beforeEach(() => {
        gameState = (0, HelperTestFunctions_1.createTestGameState)();
    });
    it('should apply pawn move correctly (a2-a4)', () => {
        const move = (0, HelperFunctions_1.parseMove)('a2-a4');
        const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
        (0, chai_1.assert)(newGameState !== null);
        const pieceAgain = newGameState.board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a4'));
        (0, chai_1.assert)(pieceAgain !== null);
        (0, chai_1.expect)(pieceAgain.getPiece()).to.equal('pawn');
        (0, chai_1.expect)(newGameState.board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a2'))).to.equal(null);
    });
    it("shouldn't apply illegal pawn move (a2-a5)", () => {
        const move = (0, HelperFunctions_1.parseMove)('a2-a5');
        const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
        (0, chai_1.expect)(newGameState).to.equal(null);
    });
    it("should apply castling move for white king", () => {
        gameState.board.removePiece((0, HelperFunctions_1.parseAlgNotation)('f1'));
        gameState.board.removePiece((0, HelperFunctions_1.parseAlgNotation)('g1'));
        const move = (0, HelperFunctions_1.parseMove)('e1-g1');
        const newGameState = ChessEngine_1.ChessEngine['simulateMove'](gameState, move);
        (0, chai_1.assert)(newGameState !== null);
        const kingPos = (0, HelperFunctions_1.parseAlgNotation)('g1');
        const rookPos = (0, HelperFunctions_1.parseAlgNotation)('f1');
        const king = newGameState.board.getPiece((0, HelperFunctions_1.parseAlgNotation)('g1'));
        const rook = newGameState.board.getPiece((0, HelperFunctions_1.parseAlgNotation)('f1'));
        (0, chai_1.assert)(king !== null);
        (0, chai_1.assert)(rook !== null);
        (0, chai_1.expect)(king.getPiece()).to.equal('king');
        (0, chai_1.expect)(rook.getPiece()).to.equal('rook');
    });
});
//# sourceMappingURL=SimulateMove.test.js.map