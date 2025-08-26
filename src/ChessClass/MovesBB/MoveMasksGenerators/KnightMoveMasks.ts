import path from "path";
import { getPosMask } from "../../BoardBB/bbUtils";
import { emptyBitboard, filledBitboard } from "../../BoardBB/BitboardConstants";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { FILES_BITBOARDS } from "../MoveConstants";
import { loadMasks, MOVE_MASKS_BASE_DIR } from "../MoveMasksFiles/MasksInit";
import { readMasks } from "../MoveMasksFiles/MoveMasksFilesFunctions";

const KNIGHT_MOVE_MASKS: Bitboard[] = [];

function calculateKnightMoveMasks() {
  const shifts: number[] = [6, 10, 15, 17, 6, 10, 15, 17];
  const masksOut: Bitboard[] = [
    ~(FILES_BITBOARDS[0] | FILES_BITBOARDS[1]),
    ~(FILES_BITBOARDS[6] | FILES_BITBOARDS[7]),
    ~FILES_BITBOARDS[0],
    ~FILES_BITBOARDS[7],
    ~(FILES_BITBOARDS[6] | FILES_BITBOARDS[7]),
    ~(FILES_BITBOARDS[0] | FILES_BITBOARDS[1]),
    ~FILES_BITBOARDS[7],
    ~FILES_BITBOARDS[0],
  ];

  for (let bit = 0; bit < 64; bit++) {
    let endMasks: Bitboard = emptyBitboard;
    
    for (let i = 0; i < 8; i++) {
      let endMask: Bitboard = getPosMask(bit) << BigInt(shifts[i % 4] * (i < 4 ? 1 : -1));
      endMask &= masksOut[i];
      endMask &= filledBitboard;
      endMasks |= endMask;
    }

    KNIGHT_MOVE_MASKS.push(endMasks);
  }
}

const filePath: string = path.join(MOVE_MASKS_BASE_DIR, 'BishopMasksFiles', 'bishop_move_masks');

loadMasks(filePath, KNIGHT_MOVE_MASKS);

export { KNIGHT_MOVE_MASKS, calculateKnightMoveMasks };