import { filledBitboard } from "../BoardBB/BitboardConstants";
import { Bitboard } from "../BoardBB/BitboardTypes";
import { LEFTMOST_FILE, RIGHTMOST_FILE, MAXIMAL_RANK, MINIMAL_RANK, RIGHT_DIAGONAL_BIT_MAP, LEFT_DIAGONAL_BIT_MAP } from "./MoveConstants";

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

function getRightDiagonalFromBit(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  
  return RIGHT_DIAGONAL_BIT_MAP[bit];
}

function getLeftDiagonalFromBit(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }
  
  return LEFT_DIAGONAL_BIT_MAP[bit];
}

function getDiagonalsFromBit(bit: number): Bitboard {
  if (bit < 0 || bit > 63) {
    throw new Error(`Bit ${bit} is out of range (0-63)`);
  }

  return LEFT_DIAGONAL_BIT_MAP[bit] | RIGHT_DIAGONAL_BIT_MAP[bit];
}

export { getFileBitboard, getRankBitboard, getRankBitboardWithOffset, getFileBitboardWithOffset, getRightDiagonalFromBit, getLeftDiagonalFromBit, getDiagonalsFromBit };