import { expect } from "chai";

import { Figure } from "../../src/ChessClass/Figure/Figure";
import { GameState } from "../../src/ChessClass/types/ChessTypes";
import { perft } from "../HelperTestFunctions";
import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";
import { parseAlgNotation } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";

describe('perft test', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = ChessEngine['initGame']({player: 'human', opponent: 'human'}, 'emptyBoard');
  });

  describe('depth 1', () => {
    it('should generate 1 legal move for pawn on a5', () => {
      const piece: Figure = new Figure('white','pawn');
      const success: boolean = ChessEngine['placeFigure'](gameState, parseAlgNotation('a5'), piece);
      expect(success).to.be.true;

      const expectedMovesCount: number = 1;
      const movesCount: number = perft(gameState, 1);
      console.log(movesCount);

      expect(movesCount).to.equal(expectedMovesCount);
    });
  });
});