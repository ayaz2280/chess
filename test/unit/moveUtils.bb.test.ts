import { expect } from 'chai';
import { Bitboard, EnumPiece } from '../../src/ChessClass/BoardBB/BitboardTypes';
import { getRankBitboard, getFileBitboard } from '../../src/ChessClass/MovesBB/MoveUtils';

describe('MoveBB.MoveUtils', () => {
  describe('getRankBitboard', () => {
    it('should return correct ranks for bits from 0 to 63', () => {
      const expectedRanks: Bitboard[] = [
        0x00000000000000ffn,
        0x000000000000ff00n,
        0x0000000000ff0000n,
        0x00000000ff000000n,
        0x000000ff00000000n,
        0x0000ff0000000000n,
        0x00ff000000000000n,
        0xff00000000000000n
      ];

      for (let bit = 0; bit < 64; bit++) {
        const rank = getRankBitboard(bit);
        const i: number = Math.floor(bit / 8);
        expect(rank).to.equal(expectedRanks[i]);
      }
    });
  });

  describe('getFileBitboard', () => {
    it('should return correct ranks for bits from 0 to 63', () => {
      const base: string[] = '00000000'.split('');
      const expectedFiles: Bitboard[] = [];

      for (let i = 0; i < 8; i++) {
        base[i] = '1';
        const file: string = `0b${base.join('').repeat(8)}`;
        base[i] = '0';
        expectedFiles.push(BigInt(file));
      }

      for (let bit = 0; bit < 63; bit++) {
        const file: Bitboard = getFileBitboard(bit);
        const expected: Bitboard = expectedFiles[Math.floor(bit % 8)];
        expect(file).to.equal(expected);
      }
      
    });
  });
})