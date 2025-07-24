"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Figure_1 = require("../../public/dist/ChessClass/Figure/Figure");
const chai_1 = require("chai");
describe('Figure', () => {
    let piece;
    beforeEach(() => {
        piece = new Figure_1.Figure('white', 'pawn');
    });
    it("the piece's color is white", () => {
        chai_1.assert.equal('white', piece.getColor());
    });
    it("the piece's type is 'pawn'", () => {
        chai_1.assert.equal('pawn', piece.getPiece());
    });
    it("'clone' method returns another Figure with the same props", () => {
        const newPiece = Figure_1.Figure.clone(piece);
        (0, chai_1.expect)(newPiece).to.not.equal(piece);
        (0, chai_1.expect)(newPiece).to.deep.equal(piece);
    });
});
//# sourceMappingURL=Figure.test.js.map