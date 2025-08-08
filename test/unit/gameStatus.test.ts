import { GameState, GameStatus, HistoryEntry, Move } from '../../src/ChessClass/types/ChessTypes';
import { ChessEngine } from '../../src/ChessClass/ChessEngine/ChessEngine';
import { expect } from 'chai';
import { parseFEN } from '../../src/ChessClass/utils/parseFEN';
import { parseAlgNotation, parseMove } from '../../src/ChessClass/Moves/AlgNotation/AlgNotation';
import { saveMoveCacheToJson } from '../../src/ChessClass/utils/jsonUtils';
import { flushAllCaches, LEGAL_MOVES_CACHE } from '../../src/ChessClass/Cache/Cache';
import { GameController } from '../../src/GameController/GameController';

describe('game status', () => {
  let gameState: GameState;
  
  it('should set game status as ongoing after game intialization', () => {
    gameState = ChessEngine.initGame({playerDetails: {player: 'human', opponent: 'human'}});

    const expectedStatus: GameStatus = {
      title: 'ongoing',
      reason: undefined,
    }

    expect(gameState.status).to.deep.equal(expectedStatus);
  });

  it('should set status to stalemate', () => {
    const fen: string = '4k3/1N5R/8/5R2/8/8/8/4K3 b - - 0 1';
    const gameState: GameState = parseFEN(fen);

    const expectedStatus: GameStatus = {
      title: 'draw',
      reason: 'stalemate',
    }

    expect(gameState.status).to.deep.equal(expectedStatus);
  })

  it('should set status to checkmate and reason to white wins', () => {
    const fen: string = '4k3/p1P4R/8/5R2/2N5/8/8/4K3 b - - 0 1';
    const gameState: GameState = parseFEN(fen);

    let success: boolean;
    success = GameController.makeMove(gameState, parseMove('a7-a6'));

    expect(success).to.be.true;

    success = GameController.makeMove(gameState, parseMove('c4-d6'));

    expect(success).to.be.true;

    const expectedStatus: GameStatus = {
      title: 'white wins',
      reason: 'checkmate',
    }

    expect(gameState.status).to.deep.equal(expectedStatus);
  });

  it('should be a draw after 50 half moves made', () => {
    gameState = ChessEngine.initGame({playerDetails: {player: 'human', opponent: 'human'}});

    let success: boolean;
    const whiteKnightMove: Move = parseMove('b1-c3');
    const whiteKnightMoveBack: Move = parseMove('c3-b1');

    const blackKnightMove: Move = parseMove('b8-c6');
    const blackKnightMoveBack: Move = parseMove('c6-b8');

    for (let i = 0; i < 50; i++) {
      const currentWhiteMove: Move = (i % 2) === 0 ? whiteKnightMove : whiteKnightMoveBack;
      const currentBlackMove: Move = (i % 2) === 0 ? blackKnightMove : blackKnightMoveBack;

      success = GameController.makeMove(gameState, currentWhiteMove);
      expect(success).to.be.true;

      success = GameController.makeMove(gameState, currentBlackMove);
      //gameState.board.display();
      expect(success).to.be.true;
    }

    const expectedStatus: GameStatus = {
      title: 'draw',
      reason: '50 moves rule',
    }

    expect(gameState.status).to.deep.equal(expectedStatus);
  });
});