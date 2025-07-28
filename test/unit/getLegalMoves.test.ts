import { assert } from "console";
import { Board } from "../../src/ChessClass/Board/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";

import { GameState, HistoryEntry, Move } from "../../src/ChessClass/types/ChessTypes";
import { createTestGameState, printEntries } from "../HelperTestFunctions";
import { expect } from "chai";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { applyMoveDebug } from "../../src/ChessClass/ChessEngine/DebugFunctions";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";
import { isSameMove } from "../../src/ChessClass/utils/MoveUtils";

describe('getLegalMoves', () => {
  let gameState: GameState;
  let board: Board;
  let entries: HistoryEntry[];

  describe('pawn moves', () => {
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
  
  describe('king moves', () => {
    beforeEach(() => {
      board = new Board();

      board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
      board.place(new Figure('white', 'rook'), parseAlgNotation('h1'));
      board.place(new Figure('white', 'rook'), parseAlgNotation('a1'));
      board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
      
      gameState = createTestGameState(board.grid, 'white');
      board = gameState.board;
    });

    it('should return 7 legal moves for white king (2 castling moves, 5 regular)', () => {

      const legalMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e1'));

      expect(legalMoves.filter(e => e.type === 'castling')).to.have.lengthOf(2); 
    });

    it('should return only 1 castling move after right rook move', () => {
      
      const rookMoveOneSquareAhead: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, parseAlgNotation('h1')).find(e => e.move.end.y === 1);

      assert(rookMoveOneSquareAhead !== undefined);

      ChessEngine.applyMove(gameState, rookMoveOneSquareAhead as HistoryEntry);

      // dummy black move
      applyMoveDebug(gameState, parseMove('e8-f8'));
      
      const legalMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e1'));

      expect(legalMoves.filter(e => e.type === 'castling')).to.have.lengthOf(1);
    });

    it('should return no castling moves after king move', () => {
      const kingMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e1'));
      const kingMoveOneSquareAhead: HistoryEntry | undefined = kingMoves.find(e => isSameMove(e.move, parseMove('e1-e2')));

      expect(kingMoveOneSquareAhead).to.not.be.undefined;

      ChessEngine.applyMove(gameState, kingMoveOneSquareAhead!);

      applyMoveDebug(gameState, parseMove('e8-f8'));

      const kingMoves2: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e2'));

      const castlingEntry: HistoryEntry | undefined = kingMoves2.find(e => e.type === 'castling');

      expect(castlingEntry).to.be.undefined;
    });
  });
  
});