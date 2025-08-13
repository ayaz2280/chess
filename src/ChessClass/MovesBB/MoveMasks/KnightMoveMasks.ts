import { getPosMask } from "../../BoardBB/bbUtils";
import { Bitboard } from "../../BoardBB/BitboardTypes";

const KNIGHT_MOVE_MASKS: Bitboard[] = [];

type FileRank = {
  file: number,
  rank: number,
}

const shifts: number[] = [6, 10, 15, 17, 6, 10, 15, 17];
const fileRankShifts: number[][] = [[2,1], [-2,1], [1,2], [-1,2], [-2,-1], [2,-1], [-1,-2], [1,-2]];

for (let bit = 0; bit < 64; bit++) {
  const endMasks: Bitboard[] = [];
  const expectedFileRanks: FileRank[] = [];
  
  for (let i = 0; i < 8; i++) {
    const endMask: Bitboard = getPosMask(bit) << BigInt(shifts[i % 4] * (i < 4 ? 1 : -1));
    endMasks.push(endMask);
  }
}