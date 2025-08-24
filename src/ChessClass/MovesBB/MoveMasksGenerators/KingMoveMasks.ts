import { displayBitboard } from "../../../UI/Bitboard/BitboardDisplay";
import { getPosMask } from "../../BoardBB/bbUtils";
import { filledBitboard } from "../../BoardBB/BitboardConstants";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { FILES_BITBOARDS } from "../MoveConstants";
import { getFileNum } from "../MoveUtils";


const KING_MOVE_MASKS: Bitboard[] = [];
const shifts: number[] = [1, 7, 8, 9];

function calculateKingMoveMasks(): void {
  for (let bit = 0; bit < 64; bit++) {
    const file: number = getFileNum(bit);
    let mask: Bitboard = 0n;
    const posMask: Bitboard = getPosMask(bit);

    shifts.forEach(sh => {
      mask |= posMask << BigInt(sh);
      mask |= posMask >> BigInt(sh);
    });

    if (file === 0) {
      mask &= FILES_BITBOARDS[0] | FILES_BITBOARDS[1]; 
    }

    if (file === 7) {
      mask &= FILES_BITBOARDS[6] | FILES_BITBOARDS[7];
    }

    mask &= filledBitboard;

    KING_MOVE_MASKS.push(mask);
  }
}

calculateKingMoveMasks();

export { KING_MOVE_MASKS };