import { expect } from 'chai';
import { Bitboard, EnumPiece } from '../../src/ChessClass/BoardBB/BitboardTypes';
import { BoardBB } from '../../src/ChessClass/BoardBB/Board';
import { parseBoardBB } from '../../src/ChessClass/utils/parseFEN';

describe('BitBoard', () => {
  let boardBB: BoardBB;

  describe('parsing', () => {
    it('should place a pawn correctly', () => {
      const fenPlacement: string = '8/8/8/8/8/8/8/6P1';

      boardBB = parseBoardBB(fenPlacement);

      const resBitboard: Bitboard = boardBB.getPieces(EnumPiece.White, EnumPiece.Pawn);
      const expectedBitboard: Bitboard = 0x0000000000000002n;

      expect(resBitboard).to.deep.equal(expectedBitboard);
    })

    it('should set starting pieces correctly', () => {
      const fenPlacement: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

      boardBB = parseBoardBB(fenPlacement);

      const fullBitboard: Bitboard = boardBB.getPieces();
      const whiteBitBoard: Bitboard = boardBB.getPieces(EnumPiece.White);
      const blackBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Black);
      const pawnBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Pawn);
      const knightBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Knight);
      const queenBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Queen);
      const kingBitBoard: Bitboard = boardBB.getPieces(EnumPiece.King);
      const rookBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Rook);
      const bishopBitBoard: Bitboard = boardBB.getPieces(EnumPiece.Bishop);

      const expectedFullBitboard: Bitboard = 0b1111111111111111000000000000000000000000000000001111111111111111n;
      const expectedWhiteBitboard: Bitboard =0b0000000000000000000000000000000000000000000000001111111111111111n;
      const expectedBlackBitboard: Bitboard =0b1111111111111111000000000000000000000000000000000000000000000000n;
      
      const expectedPawnBitboard: Bitboard = 0b0000000011111111000000000000000000000000000000001111111100000000n;
      const expectedKnightBitboard: Bitboard=0b0100001000000000000000000000000000000000000000000000000001000010n;
      const expectedQueenBitboard: Bitboard =0b0001000000000000000000000000000000000000000000000000000000010000n;
      const expectedKingBitboard: Bitboard = 0b0000100000000000000000000000000000000000000000000000000000001000n;
      const expectedRookBitboard: Bitboard = 0b1000000100000000000000000000000000000000000000000000000010000001n;
      const expectedBishopBitboard: Bitboard=0b0010010000000000000000000000000000000000000000000000000000100100n;
      
      expect(fullBitboard).to.equal(expectedFullBitboard);
      expect(whiteBitBoard).to.equal(expectedWhiteBitboard);
      expect(blackBitBoard).to.equal(expectedBlackBitboard);
      expect(pawnBitBoard).to.equal(expectedPawnBitboard);
      expect(knightBitBoard).to.equal(expectedKnightBitboard);
      expect(queenBitBoard).to.equal(expectedQueenBitboard);
      expect(kingBitBoard).to.equal(expectedKingBitboard);
      expect(rookBitBoard).to.equal(expectedRookBitboard);
      expect(bishopBitBoard).to.equal(expectedBishopBitboard);
    })
  });
})