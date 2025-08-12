import { Bitboard } from "../BoardBB/BitboardTypes";

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

export { getFileBitboard, getRankBitboard };