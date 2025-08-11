import { Position } from "../Moves/MoveTypes";
import { getMaskFromPos } from "./bbUtils";
import { emptyBitboard } from "./BitboardConstants";
import { Bitboard, EnumPiece } from "./BitboardTypes";

class BoardBB {
  private pieceBB: Bitboard[];

  constructor(pieceBB?: Bitboard[]) {
    this.pieceBB = pieceBB ?? BoardBB.createEmptyBoard();
  }

  static createEmptyBoard(): Bitboard[] {
    const pieceBB: Bitboard[] = [];

    for (let i = 0; i < 8; i++) {
      pieceBB.push(emptyBitboard);
    }

    return pieceBB;
  } 

  getPieces(color?: EnumPiece, type?: EnumPiece): Bitboard {
    let resBitBoard: Bitboard = this.pieceBB[EnumPiece.White] | this.pieceBB[EnumPiece.Black];

    if (color) {
      resBitBoard &= this.pieceBB[color];
    }

    if (type) {
      resBitBoard &= this.pieceBB[type];
    }

    return resBitBoard;
  }

  placePiece(color: EnumPiece, type: EnumPiece, pos: Position): void {
    const posMask: Bitboard = getMaskFromPos(pos);

    this.pieceBB[color] |= posMask;
    this.pieceBB[type] |= posMask;
    
  }

  removePiece(color: EnumPiece, type: EnumPiece, pos: Position): void {
    const posMask: Bitboard = ~getMaskFromPos(pos);

    this.pieceBB[color] &= posMask;
    this.pieceBB[type] &= posMask;
  }
} 

export { BoardBB };