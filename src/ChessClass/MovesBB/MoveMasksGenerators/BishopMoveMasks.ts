import path from "path";
import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { readMasks } from "../MoveMasksFiles/MoveMasksFilesFunctions";
import { getDiagonalsFromBit, getFileBitboard, getRankBitboard } from "../MoveUtils";
import { MOVE_MASKS_BASE_DIR } from "../MoveMasksFiles/MasksInit";

const BISHOP_MOVE_MASKS: Bitboard[] = [];

function calculateBishopMoveMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = getDiagonalsFromBit(bit) & ~getPosMask(bit);

    BISHOP_MOVE_MASKS.push(mask);
  }
}

async function loadBishopMoveMasks(): Promise<void> {
  const filePath: string = path.join(MOVE_MASKS_BASE_DIR, 'BishopMasksFiles', 'bishop_move_masks');
  try {
    const buffer: Bitboard[] = await readMasks(filePath);
    BISHOP_MOVE_MASKS.push(...buffer);
  } catch (err: any) {
    console.error('Error fetching masks', err);
  }

}
//calculateBishopMoveMasks();
loadBishopMoveMasks();

export { BISHOP_MOVE_MASKS, calculateBishopMoveMasks };