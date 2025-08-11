import { emptyBitboard } from "./BitboardConstants";
import { Bitboard } from "./BitboardTypes";

enum enumPiece {
    White,
    Black,
    Pawn,
    Knight,
    Bishop,
    Queen,
    King
}

class Board {
  private pieceBB: Bitboard[];

  constructor(pieceBB: Bitboard[]) {
    this.pieceBB = pieceBB ?? Board.createEmptyBoard();
  }

  static createEmptyBoard(): Bitboard[] {
    const pieceBB: Bitboard[] = [];

    for (let i = 0; i < 8; i++) {
      pieceBB.push(emptyBitboard);
    }

    return pieceBB;
  } 


} 