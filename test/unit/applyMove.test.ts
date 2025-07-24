import { assert } from "console";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/HelperFunctions";
import { GameState, HistoryEntry, Move } from "../../src/ChessClass/types/ChessTypes";
import { createTestGameState, printEntries } from "../HelperTestFunctions";
import { expect } from "chai";
import { Figure } from "../../src/ChessClass/Figure/Figure";

describe('applyMove()', () => {
  let gameState: GameState;
  let board: Board;
  let entries: HistoryEntry[];

  beforeEach(() => {
    gameState = createTestGameState();
    board = gameState.board;
    entries = gameState.moveHistory;
  });

  it('should apply pawn first move correctly', () => {
    const move: Move = parseMove('a2-a4');

    const success: boolean = ChessEngine['applyMove'](gameState, move);

    assert(true === success);

    expect(entries).to.have.lengthOf(1);
    expect(entries[entries.length - 1].move).to.deep.equal(move);
    expect(board.getPiece(parseAlgNotation('a2'))).to.equal(null);
    expect(board.getPiece(parseAlgNotation('a4'))).to.deep.equal(new Figure('white', 'pawn'));
  });

  it('shouldnt apply illegal pawn move', () => {
    const move: Move = parseMove('a2-a5');

    const success: boolean = ChessEngine['applyMove'](gameState, move);

    assert(false === success);

    expect(entries).to.have.lengthOf(0);
    expect(board.getPiece(parseAlgNotation('a2'))).to.deep.equal(new Figure('white', 'pawn'));
    expect(board.getPiece(parseAlgNotation('a5'))).to.deep.equal(null);
  });
});