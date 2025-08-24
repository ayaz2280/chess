import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { getDiagonalsFromBit, getFileBitboard, getRankBitboard } from "../MoveUtils";
import { ROOK_MOVE_MASKS } from "./RookMoveMasks";

const QUEEN_MOVE_MASKS: Bitboard[] = [];

function calculateQueenMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = (getFileBitboard(bit) | getRankBitboard(bit) | getDiagonalsFromBit(bit)) & ~getPosMask(bit);

    QUEEN_MOVE_MASKS.push(mask);
  }
}

calculateQueenMoveMasks();

export { QUEEN_MOVE_MASKS };