import { assert } from "console";
import { Board } from "../../src/ChessClass/Board/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";

import { GameState, HistoryEntry, Move } from "../../src/ChessClass/types/ChessTypes";
import { createTestGameState, printEntries } from "../HelperTestFunctions";
import { expect } from "chai";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { applyMoveDebug } from "../../src/ChessClass/ChessEngine/DebugFunctions";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";

describe('applyMove()', () => {
  let gameState: GameState;
  let board: Board;
  let entries: HistoryEntry[];

  beforeEach(() => {
    gameState = createTestGameState();
    board = gameState.board;
    entries = gameState.moveHistory;
  });

  it('should return 2 legal moves for white pawn', () => {
    const moves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('a2'));

    const expectedMoves: Move[] = [
      parseMove('a2-a3'),
      parseMove('a2-a4'),
    ]

    expect(moves.map(e => e.move)).to.have.deep.members(expectedMoves);
  });

  it('should return 2 legal moves for black pawn (one square and en passant)', () => {
    applyMoveDebug(gameState, parseMove('h2-h3'));
    applyMoveDebug(gameState, parseMove('a7-a5'));
    applyMoveDebug(gameState, parseMove('h3-h4'));
    applyMoveDebug(gameState, parseMove('a5-a4'));
    applyMoveDebug(gameState, parseMove('b2-b4'));

    const moves: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, parseAlgNotation('a4'));

    const expectedMoves: Move[] = [
      parseMove('a4-a3'),
      parseMove('a4-b3'),
    ]

    expect(moves.map(e => e.move)).to.have.deep.members(expectedMoves);
  });
});