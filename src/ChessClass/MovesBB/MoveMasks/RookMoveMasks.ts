import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { getFileBitboard, getRankBitboard } from "../MoveUtils";

const ROOK_MOVE_MASKS: Bitboard[] = [];

function calculateRookMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = (getFileBitboard(bit) | getRankBitboard(bit)) & ~getPosMask(bit);

    ROOK_MOVE_MASKS.push(mask);
  }
}

calculateRookMoveMasks();

export { ROOK_MOVE_MASKS };