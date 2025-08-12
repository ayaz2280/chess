import { filledBitboard } from "../BoardBB/BitboardConstants";
import { Bitboard } from "../BoardBB/BitboardTypes";

const MINIMAL_RANK: Bitboard = 0x00000000000000ffn;
const MAXIMAL_RANK: Bitboard = 0xff00000000000000n;
const LEFTMOST_FILE: Bitboard =  0b1000000010000000100000001000000010000000100000001000000010000000n;
const RIGHTMOST_FILE: Bitboard = 0b0000000100000001000000010000000100000001000000010000000100000001n;

function getFileBitboard(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  return 0x8080808080808080n >> BigInt(bit % 8);
}

function getFileBitboardWithOffset(bit: number, offset: number, direction: 'LEFT' | 'RIGHT'): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  if (offset < 0 || offset > 7) {
    throw new Error(`Offset ${offset} is out of range (0 to 7)`);
  }

  const fileNum: number = bit % 8;
  const fileNumWithOffset: number = direction === 'LEFT' ? fileNum - offset : fileNum + offset;

  if (fileNumWithOffset < 0) {
    return LEFTMOST_FILE;
  }

  if (fileNumWithOffset > 7) {
    return RIGHTMOST_FILE;
  }

  const fileBB: Bitboard = getFileBitboard(bit);

  const fileBbOffset: Bitboard = (
    direction === 'LEFT' 
    ? fileBB << BigInt(offset)
    : fileBB >> BigInt(offset)
  );

  return fileBbOffset;
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

export { getFileBitboard, getRankBitboard, getRankBitboardWithOffset, getFileBitboardWithOffset };