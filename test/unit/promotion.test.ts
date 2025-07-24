import { assert, expect } from 'chai';
import { Board } from '../../src/ChessClass/Board';
import { ChessEngine } from '../../src/ChessClass/ChessEngine';
import { Figure } from '../../src/ChessClass/Figure/Figure';
import { parseAlgNotation, styled } from '../../src/ChessClass/HelperFunctions';
import {FigureType, GameState, HistoryEntry, PromotionDetails} from '../../src/ChessClass/types/ChessTypes';
import { cloneGameState, initGameStateHash } from '../../src/ChessClass/GameStateHelperFunctions';


describe('promotion test', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = ChessEngine['initGame'](
      {
        player: 'human',
        opponent: 'human',
      }, 'emptyBoard', 'white',
    );
    gameState.board = new Board();
    board = gameState.board;
  });

  it('should return 4 pawn promotion moves', () => {
    const pawn: Figure = new Figure('white', 'pawn');
    board.place(pawn, parseAlgNotation('h7')); 

    const legalMoves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('h7'));

    expect(legalMoves).to.be.lengthOf(4);

    const promDetailsArr: PromotionDetails[] = legalMoves.map(entry => entry.promotionDetails);

    const expectedPromotedToArr: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['queen', 'bishop', 'rook','knight'];
    promDetailsArr.forEach(p => {
      expect(p.isPromotion).to.be.true;
      expect(expectedPromotedToArr).to.include(p.promotedTo);  
    });
  });

  it('should apply pawn promotion move correctly', () => {
    const pawn: Figure = new Figure('white', 'pawn');
    board.place(pawn, parseAlgNotation('h7')); 

    const legalMoves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('h7'));

    const rookPromotionMove: HistoryEntry | undefined = legalMoves.find(e => e.promotionDetails.promotedTo === 'rook');

    assert(rookPromotionMove);

    //console.log(rookPromotionMove);

    ChessEngine['applyMove'](gameState, rookPromotionMove);

    expect(pawn.getPiece()).to.equal('rook');
    expect(gameState.moveHistory.at(-1)).to.equal(rookPromotionMove);

    //gameState.board.display();
  });

  it('should apply pawn promotion move on attack correctly', () => {
    const pawn: Figure = new Figure('white', 'pawn');

    const leftRook: Figure = new Figure('black', 'rook');
    const rightRook: Figure = new Figure('black', 'rook');
    const bishop: Figure = new Figure('white', 'bishop');

    board.place(pawn, parseAlgNotation('g7'));
    board.place(leftRook, parseAlgNotation('f8'));
    board.place(rightRook, parseAlgNotation('h8'));
    board.place(bishop, parseAlgNotation('g8'));

    const moves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('g7'));

    expect(moves).to.be.lengthOf(8);

    moves.forEach(e => {
      const promDetails: PromotionDetails = e.promotionDetails;

      expect(promDetails.isPromotion).to.be.true;
    })
  });

  it.only('should undo promotion correctly', () => {
    const pawn: Figure = new Figure('white', 'pawn');
    board.place(pawn, parseAlgNotation('h7')); 

    const savedHash: bigint = initGameStateHash(gameState);
    const savedGameState: GameState = cloneGameState(gameState);

    const legalMoves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('h7'));

    const rookPromotionMove: HistoryEntry | undefined = legalMoves.find(e => e.promotionDetails.promotedTo === 'rook');

    assert(rookPromotionMove);

    //console.log(rookPromotionMove);

    ChessEngine['applyMove'](gameState, rookPromotionMove);

    expect(pawn.getPiece()).to.equal('rook');
    expect(gameState.moveHistory.at(-1)).to.equal(rookPromotionMove);

    // undoing a move

    const success: boolean = ChessEngine['undoLastMove'](gameState);
    expect(success).to.be.true;
    expect(gameState.moveHistory).to.be.of.length(0);
    expect(pawn.getPiece()).to.equal('pawn');
    expect(board.getPiece(parseAlgNotation('h7'))).to.equal(pawn);

    expect(gameState).to.deep.equal(savedGameState);
    expect(gameState.hash).to.equal(savedHash);
  })
});