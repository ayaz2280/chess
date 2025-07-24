import { expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { parseMove } from "../../src/ChessClass/HelperFunctions";
import { GameState } from "../../src/ChessClass/types/ChessTypes";

describe('full move counter', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'});
    board = gameState.board;
  });

  it('should update full move counter by 2', () => {
    const algMoves: string[] = ['c2-c4','d7-d5','c4-d5','d8-d5'];
    const expectedFullMoveCounters: number[] = [1,2,2,3];
    algMoves.forEach((algMove, id) => {
      const success: boolean = ChessEngine.applyMoveDebug(gameState, parseMove(algMove));

      expect(success).to.be.true;
      expect(expectedFullMoveCounters[id]).to.equal(gameState.fullMoveCounter);
    });
  });

  it.only('should update full move counter with undos', () => {
    const algMoves: string[] = ['c2-c4','d7-d5','c4-d5','d8-d5','e2-e4','d5-e4','d1-e2','e4-e2'];
    const timesToUndo: number = algMoves.length;
    const expectedFullMoveCounters: number[] = [1,2,2,3,3,4,4,5,4,4,3,3,2,2,1,1];

    algMoves.forEach((algMove, id) => {
      const success: boolean = ChessEngine.applyMoveDebug(gameState, parseMove(algMove));

      expect(success).to.be.true;
      expect(expectedFullMoveCounters[id]).to.equal(gameState.fullMoveCounter);
    });

    for (let i = algMoves.length; i < timesToUndo+algMoves.length; i++) {
      //console.log(gameState.moveHistory.length);
      const success: boolean = ChessEngine.undoLastMove(gameState);

      expect(success).to.be.true;
      expect(expectedFullMoveCounters[i]).to.equal(gameState.fullMoveCounter);
    }
  });
});