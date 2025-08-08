import { GameState, GameStatus, HistoryEntry } from '../../src/ChessClass/types/ChessTypes';
import { ChessEngine } from '../../src/ChessClass/ChessEngine/ChessEngine';
import { expect } from 'chai';
import { parseFEN } from '../../src/ChessClass/utils/parseFEN';
import { parseAlgNotation } from '../../src/ChessClass/Moves/AlgNotation/AlgNotation';
import { saveMoveCacheToJson } from '../../src/ChessClass/utils/jsonUtils';
import { flushAllCaches, LEGAL_MOVES_CACHE } from '../../src/ChessClass/Cache/Cache';

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

  it.only('should set status to stalemate', () => {
    const fen: string = '4k3/1N5R/8/5R2/8/8/8/4K3 b - - 0 1';
    const gameState: GameState = parseFEN(fen);

    flushAllCaches();
    const legalMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation(`e8`));

    console.log(legalMoves);

    const expectedStatus: GameStatus = {
      title: 'draw',
      reason: 'stalemate',
    }

    expect(gameState.status).to.deep.equal(expectedStatus);
  })
});