import { Position } from "../LegacyMoves/MoveTypes";
import { Bitboard, EnumPiece } from "./BitboardTypes";

function getMaskFromPos(pos: Position): Bitboard {
  return 1n << BigInt(pos.y * 8 + pos.x);
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

export { getMaskFromPos, getEnumPieceType };