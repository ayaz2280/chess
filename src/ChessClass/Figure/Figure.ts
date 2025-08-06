import type { FigureType } from "./FigureTypes";
import type { ColorType } from "../Player/PlayerTypes";
import { SLIDING_PIECE_TYPES } from "./FigureConstants";

class Figure {
  private color: ColorType;
  private piece: FigureType;
  static ID_COUNTER: number = 0;
  //readonly id: number;

  constructor(color: ColorType, piece: FigureType) {
    this.color = color;
    this.piece = piece;
    //this.id = Figure.ID_COUNTER++;

  }

  getColor() {
    return this.color;
  }

  getPiece() {
    return this.piece;
  }

  setColor(color: ColorType) {
    this.color = color;
  }

  setPiece(piece: FigureType) {
    this.piece = piece;
  }

  toJSON() {
    return {
      color: this.color,
      piece: this.piece,
    }
  }

  isSlidingPiece(): boolean {
    return SLIDING_PIECE_TYPES.includes(this.piece);
  }

  static clone(piece: Figure): Figure {
    return new Figure(piece.color, piece.piece);
  }

  static isSameFigure(f1: Figure , f2: Figure) {
    return f1.color === f2.color && f1.piece === f2.piece;
  }
}

export { Figure };


