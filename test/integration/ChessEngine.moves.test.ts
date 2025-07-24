import { expect } from "chai";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseAlgNotation } from "../../src/ChessClass/HelperFunctions";
import { GameState } from "../../src/ChessClass/types/ChessTypes";
import { perft } from "../HelperTestFunctions";

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