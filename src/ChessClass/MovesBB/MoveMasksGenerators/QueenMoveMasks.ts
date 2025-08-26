import path from "path";
import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { loadMasks, MOVE_MASKS_BASE_DIR } from "../MoveMasksFiles/MasksInit";
import { readMasks } from "../MoveMasksFiles/MoveMasksFilesFunctions";
import { getDiagonalsFromBit, getFileBitboard, getRankBitboard } from "../MoveUtils";


const QUEEN_MOVE_MASKS: Bitboard[] = [];

function calculateQueenMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = (getFileBitboard(bit) | getRankBitboard(bit) | getDiagonalsFromBit(bit)) & ~getPosMask(bit);

    QUEEN_MOVE_MASKS.push(mask);
  }
}

const filePath: string = path.join(MOVE_MASKS_BASE_DIR, 'QueenMasksFiles', 'queen_move_masks');

//calculateBishopMoveMasks();
loadMasks(filePath, QUEEN_MOVE_MASKS);
//calculateQueenMoveMasks();

export { QUEEN_MOVE_MASKS, calculateQueenMoveMasks };