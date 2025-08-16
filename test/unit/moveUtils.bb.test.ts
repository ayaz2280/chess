import { expect } from 'chai';
import { Bitboard, EnumPiece } from '../../src/ChessClass/BoardBB/BitboardTypes';
import { getRankBitboard, getFileBitboard, getRankBitboardWithOffset, getFileBitboardWithOffset, getLeftDiagonalFromBit } from '../../src/ChessClass/MovesBB/MoveUtils';
import { LEFT_DIAGONAL_BIT_MAP, LEFT_DIAGONALS, RIGHT_DIAGONAL_BIT_MAP, RIGHT_DIAGONALS } from '../../src/ChessClass/MovesBB/MoveConstants';
import { KNIGHT_MOVE_MASKS } from '../../src/ChessClass/MovesBB/MoveMasks/KnightMoveMasks';
import { ROOK_MOVE_MASKS } from '../../src/ChessClass/MovesBB/MoveMasks/RookMoveMasks';
import { QUEEN_MOVE_MASKS } from '../../src/ChessClass/MovesBB/MoveMasks/QueenMoveMasks';
import { PAWN_ATTACK_MASKS, PAWN_PUSH_MASKS } from '../../src/ChessClass/MovesBB/MoveMasks/PawnMoveMasks';
import { displayBitboard } from '../../src/UI/Bitboard/BitboardDisplay';

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

    it('should return correct ranks with offset for bits from 0 to 63', () => {
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
        for (let offset = 0; offset <= 7; offset++) {
          const rankUp = getRankBitboardWithOffset(bit, offset, 'UP');
          const rankDown = getRankBitboardWithOffset(bit, offset, 'DOWN');

          const expectedRankUp: Bitboard = expectedRanks[Math.min(7, Math.floor(bit / 8) + offset)];
          const expectedRankDown: Bitboard = expectedRanks[Math.max(0, Math.floor(bit / 8) - offset)];

          expect(rankUp).to.equal(expectedRankUp);
          expect(rankDown).to.equal(expectedRankDown);
        }
      }
    });

    it('should return correct files with offset for bits from 0 to 63', () => {
      const expectedFiles: Bitboard[] = [
        0b1000000010000000100000001000000010000000100000001000000010000000n,
        0b0100000001000000010000000100000001000000010000000100000001000000n,
        0b0010000000100000001000000010000000100000001000000010000000100000n,
        0b0001000000010000000100000001000000010000000100000001000000010000n,
        0b0000100000001000000010000000100000001000000010000000100000001000n,
        0b0000010000000100000001000000010000000100000001000000010000000100n,
        0b0000001000000010000000100000001000000010000000100000001000000010n,
        0b0000000100000001000000010000000100000001000000010000000100000001n
      ];

      for (let bit = 0; bit < 64; bit++) {
        for (let offset = 0; offset <= 7; offset++) {
          const fileLeft = getFileBitboardWithOffset(bit, offset, 'LEFT');
          const fileRight = getFileBitboardWithOffset(bit, offset, 'RIGHT');

          const expectedFileLeft: Bitboard = expectedFiles[Math.max(0, Math.floor(bit % 8) - offset)];
          const expectedFileRight: Bitboard = expectedFiles[Math.min(7, Math.floor(bit % 8) + offset)];

          expect(fileLeft).to.equal(expectedFileLeft);
          expect(fileRight).to.equal(expectedFileRight);
        }
      }
    });
  });

  describe('getFileBitboard', () => {
    it('should return correct files for bits from 0 to 63', () => {
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

  describe('getRightDiagonalFromBit', () => {
    it('should return correct diagonals for bits from 0 to 63', () => {

      for (let bit = 0; bit < 64; bit++) {
        const moves: Bitboard = PAWN_ATTACK_MASKS[bit];

        console.log(`Bit ${bit}`);
        displayBitboard(moves);
        console.log();

      }
    })
  });
})