import { assert, expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { parseMove } from "../../src/ChessClass/HelperFunctions";
import { GameState, HistoryEntry, Move } from "../../src/ChessClass/types/ChessTypes";

describe('Half Move Clock Counter Test', () => {
  let gameState: GameState;
  let board: Board;
  let history: HistoryEntry[];

  beforeEach(() => {
    gameState = ChessEngine['initGame']('human', 'human');
    board = gameState.board;
    history = gameState.moveHistory;
  });

  it('should increment counter by 1 when knight moves', () => {
    expect(gameState.halfMoveClock).to.equal(0);

    const success: boolean = ChessEngine['applyMoveDebug'](gameState, parseMove('g1-f3'));

    expect(success).to.be.true;
    expect(gameState.halfMoveClock).to.equal(1);
  });

  it('should reset counter after pawn move and store the prev value', () => {
    expect(gameState.halfMoveClock).to.equal(0);

    ChessEngine['applyMoveDebug'](gameState, parseMove('g1-f3'));

    expect(gameState.halfMoveClock).to.equal(1);

    ChessEngine['applyMoveDebug'](gameState, parseMove('a2-a4'));

    expect(gameState.halfMoveClock).to.equal(0);

    expect(history[history.length - 1].prevDetails.prevHalfMoveClock).to.equal(1);
  });

  it('should update correctly on the series of moves', () => {
    const algMoveSeries: string[] = [
      'g1-f3', 'g8-f6', 'f3-h4', 'd7-d5', 'g2-g4', 'f6-d7','f1-h3','b8-a6','e1-g1', 'd5-d4', 'e2-e4', 'd4-e3',
    ];
    
    const expectedCounterValues: number[] = [1,2,3,0,0,1,2,3,4,0,0,0];

    algMoveSeries.forEach((algMove, id) => {
      const success: boolean = ChessEngine.applyMoveDebug(gameState, parseMove(algMove));

      assert.equal(success, true, `Expected success to be true, but was '${success}' for move ${algMove}`);
      expect(gameState.halfMoveClock).to.equal(expectedCounterValues[id]);
    })
  });

  it('should restore values correctly on undo', () => {
    const algMoveSeries: string[] = [
      'g1-f3', 'g8-f6', 'f3-h4', 'd7-d5', 'g2-g4', 'f6-d7','f1-h3','b8-a6','e1-g1', 'd5-d4', 'e2-e4', 'd4-e3',
    ];
    
    const expectedCounterValues: number[] = [1,2,3,0,0,1,2,3,4,0,0,0];

    algMoveSeries.forEach((algMove, id) => {
      const success: boolean = ChessEngine.applyMoveDebug(gameState, parseMove(algMove));

      assert.equal(success, true, `Expected success to be true, but was '${success}' for move ${algMove}`);
      expect(gameState.halfMoveClock).to.equal(expectedCounterValues[id]);
    });

    const expectedUndoValues: number[] = [...expectedCounterValues.slice(0,-1).reverse(), 0];

    expectedUndoValues.forEach((val, id) => {
      const success = ChessEngine['undoLastMove'](gameState);
      expect(success).to.be.true;

      expect(gameState.halfMoveClock).to.equal(val);
    });
  });
});