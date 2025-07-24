import { Figure } from "../../public/dist/ChessClass/Figure/Figure";
import {assert, expect} from "chai";

describe('Figure', () => {
  let piece: Figure;

  beforeEach(() => {
    piece = new Figure('white', 'pawn');
  });

  it("the piece's color is white", () => {
    assert.equal('white', piece.getColor());
  });

  it("the piece's type is 'pawn'", () => {
    assert.equal('pawn', piece.getPiece());
  })

  it("'clone' method returns another Figure with the same props", () => {
    const newPiece: Figure = Figure.clone(piece);

    expect(newPiece).to.not.equal(piece);
    expect(newPiece).to.deep.equal(piece);
  }) 
});