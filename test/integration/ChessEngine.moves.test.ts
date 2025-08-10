import { expect } from "chai";

import { Figure } from "../../src/ChessClass/Figure/Figure";
import { GameState } from "../../src/ChessClass/types/ChessTypes";

import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";
import { parseAlgNotation } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";
import { placeFigure } from "../../src/ChessClass/ChessEngine/DebugFunctions";
import { perft } from "../../src/ChessClass/ChessEngine/perft";

const NODE_COUNT_INIT_POS: number[] = [1,20,400,8902];

function test(gameState: GameState, nodeCounts: number[]): void {
  nodeCounts.forEach((nodeCount, depth) => {
    it(`should generate ${nodeCount} nodes on depth ${depth}`, () => {
      const movesCount: number = perft(gameState, depth);
      expect(movesCount).to.equal(nodeCount);
    })
  })
}

describe('perft test', () => {
  let gameState: GameState;

  before(() => {
    gameState = ChessEngine.initGame({playerDetails: {player: 'human', opponent: 'human'}});
  });
    
  describe('initial position', () => {
    gameState = ChessEngine.initGame({playerDetails: {player: 'human', opponent: 'human'}});
    test(gameState, NODE_COUNT_INIT_POS);
  });
});