import { Position } from "../LegacyMoves/MoveTypes";
import { inRange } from "../utils/utils";
import { Bitboard, EnumPiece } from "./BitboardTypes";

function getMaskFromPos(pos: Position): Bitboard {
  return getPosMask(pos.y * 8 + pos.x);
}

function getPosMask(bit: number): Bitboard {
  if (!inRange(bit, 0, 63)) {
    throw new Error(`Bit ${bit} is not in range from 0 to 63`);
  }

  return 1n << ( 8n * (BigInt(bit) / 8n) - BigInt(bit) % 8n + 7n );
}

function getEnumPieceType(piece: string): EnumPiece {
  const p: string = piece.toLowerCase();
  switch (p) {
    case 'p': return EnumPiece.Pawn;
    case 'q': return EnumPiece.Queen;
    case 'k': return EnumPiece.King;
    case 'b': return EnumPiece.Bishop;
    case 'n': return EnumPiece.Knight;
    case 'r': return EnumPiece.Rook;
    default: throw new Error(`Couldn't parse a piece with name '${piece}'`);
  }
}

export { getMaskFromPos, getEnumPieceType, getPosMask };