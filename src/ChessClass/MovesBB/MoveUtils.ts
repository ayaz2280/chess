import { filledBitboard } from "../BoardBB/BitboardConstants";
import { Bitboard } from "../BoardBB/BitboardTypes";

const MINIMAL_RANK: Bitboard = 0x00000000000000ffn;
const MAXIMAL_RANK: Bitboard = 0xff00000000000000n;

function getFileBitboard(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  return 0x8080808080808080n >> BigInt(bit % 8);
}

function getRankBitboard(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  return 0x00000000000000ffn << (8n * (BigInt(bit) / 8n));
}

function getRankBitboardWithOffset(bit: number, offset: number, direction: 'UP' | 'DOWN'): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  if (offset < 0 || offset > 7) {
    throw new Error(`Offset ${offset} is out of range (0 to 7)`);
  }

  const rankBB: Bitboard = getRankBitboard(bit);

  const rankBbOffset: Bitboard = (
    direction === 'UP' 
    ? rankBB << (8n * BigInt(offset)) 
    : rankBB >> (8n * BigInt(offset))
  );

  const rankBbOffsetMasked: Bitboard = rankBbOffset & filledBitboard;

  if (rankBbOffsetMasked === 0n) {
    return direction === 'UP' ? MAXIMAL_RANK : MINIMAL_RANK;
  }
  return rankBbOffset;
}

export { getFileBitboard, getRankBitboard, getRankBitboardWithOffset };