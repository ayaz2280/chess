import { Position } from "../Moves/MoveTypes";
import { Bitboard } from "./BitboardTypes";

function getMaskFromPos(pos: Position): Bitboard {
  return 1n << BigInt(pos.y * 8 + pos.x);
}

export { getMaskFromPos };