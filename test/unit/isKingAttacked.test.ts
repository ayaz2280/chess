import { expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseAlgNotation } from "../../src/ChessClass/HelperFunctions";
import { GameState } from "../../src/ChessClass/types/ChessTypes";
import { createTestGameState } from "../HelperTestFunctions";

describe('isKingAttacked()', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = createTestGameState();

  });

  it('should return true for white rook directly attacking black king on whites turn', () => {
    board = new Board();
    board.place(new Figure('white', 'rook'), parseAlgNotation('e1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    gameState.board = board;

    const isAttacked: boolean = ChessEngine['isKingAttacked'](gameState, 'black');

    expect(isAttacked).to.equal(true);
  });

  it('should return false for black king being blocked from whites rooks attack', () => {
    board = new Board();
    board.place(new Figure('white', 'rook'), parseAlgNotation('e1'));
    board.place(new Figure('black', 'knight'), parseAlgNotation('e7'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    gameState.board = board;

    const isAttacked: boolean = ChessEngine['isKingAttacked'](gameState, 'black');

    expect(isAttacked).to.equal(false);
  });
});