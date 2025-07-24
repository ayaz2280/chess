import { assert, expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { calculateHash, cloneGameState } from "../../src/ChessClass/GameStateHelperFunctions";
import { GameState } from "../../src/ChessClass/types/ChessTypes";
import { parseMove } from "../../src/ChessClass/HelperFunctions";

describe('undoLastMove()', () => {
  let gameState: GameState;
  let board: Board;
  let savedGameState: GameState;
  let tmpHash: bigint;
  
  beforeEach(() => {
    gameState = ChessEngine['initGame'](
      {
        player: 'human',
        opponent: 'human',
      },
    );
    board = gameState.board;
    savedGameState = cloneGameState(gameState);
  });

  it('should return the same gamestate after pawn move undo', () => {

    expect(gameState).to.deep.equal(savedGameState);

    const success = ChessEngine.applyMoveDebug(gameState, parseMove('a2-a4'));

    expect(success).to.be.true;

    const undoSuccess = ChessEngine.undoLastMove(gameState);

    expect(undoSuccess).to.be.true;

    expect(gameState).to.deep.equal(savedGameState);
  });

  it('should return the same gamestate after series of moves', () => {
    ChessEngine.applyMoveDebug(gameState, parseMove('c2-c4'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);
    ChessEngine.applyMoveDebug(gameState, parseMove('d7-d5'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);

    ChessEngine.applyMoveDebug(gameState, parseMove('g1-f3'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);

    ChessEngine.applyMoveDebug(gameState, parseMove('d5-d4'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);

    ChessEngine.applyMoveDebug(gameState, parseMove('e2-e4'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);

    ChessEngine.applyMoveDebug(gameState, parseMove('d4-e3'));
    tmpHash = calculateHash(gameState);
    expect(gameState.hash!).to.equal(tmpHash);

    for (let i = 0; i < 6; i++) {
      const success = ChessEngine['undoLastMove'](gameState);
      expect(success).to.be.true;
      tmpHash = calculateHash(gameState);
      expect(gameState.hash!).to.equal(tmpHash);
    }

    board.display();

    expect(gameState).to.deep.equal(savedGameState);

  });
});