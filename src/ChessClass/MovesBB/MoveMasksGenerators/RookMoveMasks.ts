import path from "path";
import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { getFileBitboard, getRankBitboard } from "../MoveUtils";
import { loadMasks, MOVE_MASKS_BASE_DIR } from "../MoveMasksFiles/MasksInit";
import { readMasks } from "../MoveMasksFiles/MoveMasksFilesFunctions";


const ROOK_MOVE_MASKS: Bitboard[] = [];

function calculateRookMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = (getFileBitboard(bit) | getRankBitboard(bit)) & ~getPosMask(bit);

    ROOK_MOVE_MASKS.push(mask);
  }
}

const filePath: string = path.join(MOVE_MASKS_BASE_DIR, 'RookMasksFiles', 'rook_move_masks');
  
//calculateBishopMoveMasks();
loadMasks(filePath, ROOK_MOVE_MASKS);

export { ROOK_MOVE_MASKS, calculateRookMoveMasks };