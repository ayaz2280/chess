import { getPosMask, getPosMaskShiftLeft, getPosMaskShiftRight } from "../../BoardBB/bbUtils";
import { filledBitboard } from "../../BoardBB/BitboardConstants";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { getFileNum } from "../MoveUtils";
import { displayBitboard } from "../../../UI/Bitboard/BitboardDisplay";
import { FILES_BITBOARDS } from "../MoveConstants";
import path from "path";
import { loadMasks, MOVE_MASKS_BASE_DIR } from "../MoveMasksFiles/MasksInit";
import { readMasks } from "../MoveMasksFiles/MoveMasksFilesFunctions";

const PAWN_PUSH_MASKS: Bitboard[] = [];
const PAWN_ATTACK_MASKS: Bitboard[] = [];
const PAWN_EN_PASSANT_FILE_MASKS: Bitboard[] = [...FILES_BITBOARDS];

function calculatePawnPushMasks() {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard;
    if (bit >= 0 && bit <= 7 || bit >= 56 && bit <= 63) {
      mask = 0n; // No push possible on the first and last ranks
    } else {
      mask = getPosMaskShiftRight(bit, 8);

      if (bit >= 8 && bit <= 15) {
        mask |= getPosMaskShiftRight(bit, 16);
      }

    }

    mask &= filledBitboard;
    PAWN_PUSH_MASKS.push(mask);
  }
}

function calculatePawnAttackMasks(): void {
  for (let bit = 0; bit < 64; bit++) {
    let mask: Bitboard = 0n;
    //displayBitboard(mask);
    if (bit > 55) {
      PAWN_ATTACK_MASKS.push(mask);
      continue; // No attack possible on the first and last ranks
    }

    const fileNum: number = getFileNum(bit);

    if (fileNum === 0) {
      mask |= getPosMask(bit) << 7n;
      //displayBitboard(mask);
    }

    if (fileNum === 7) {
      mask |= getPosMask(bit) << 9n;
      //displayBitboard(mask);
    }

    if (fileNum !== 0 && fileNum !== 7) {
      mask |= getPosMask(bit) << 7n;
      mask |= getPosMask(bit) << 9n;
    }

    mask &= filledBitboard;
    //displayBitboard(mask);
    PAWN_ATTACK_MASKS.push(mask);
  }
}

const filePath: string = path.join(MOVE_MASKS_BASE_DIR, 'PawnMasksFiles');

loadMasks(path.join(filePath, 'pawn_push_masks'), PAWN_PUSH_MASKS);
loadMasks(path.join(filePath, 'pawn_attack_masks'), PAWN_ATTACK_MASKS);
  
//calculateBishopMoveMasks();


//calculatePawnPushMasks();
//calculatePawnAttackMasks();

export { PAWN_PUSH_MASKS, PAWN_ATTACK_MASKS, PAWN_EN_PASSANT_FILE_MASKS, calculatePawnAttackMasks, calculatePawnPushMasks };