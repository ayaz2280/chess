import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { getDiagonalsFromBit, getFileBitboard, getRankBitboard } from "../MoveUtils";

const BISHOP_MOVE_MASKS: Bitboard[] = [];

function calculateBishopMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = getDiagonalsFromBit(bit) & ~getPosMask(bit);

    BISHOP_MOVE_MASKS.push(mask);
  }
}

calculateBishopMoveMasks();

export { BISHOP_MOVE_MASKS };