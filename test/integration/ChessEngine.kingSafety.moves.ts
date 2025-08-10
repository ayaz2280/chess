/*import { expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { HumanPlayer } from "../../src/ChessClass/Player";
import { GameState, HistoryEntry, Move, Position } from "../../src/ChessClass/types/ChessTypes";

import { parseAlgNotation } from "../../src/ChessClass/HelperFunctions";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseMove } from "../../src/ChessClass/HelperFunctions";
import { createTestGameState } from "../HelperTestFunctions";

Error.stackTraceLimit = 5;

// Test getMoves
describe('getMoves()', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = createTestGameState();
    gameState.player = new HumanPlayer('white');
  });

});

describe('getLegalMoves()', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = createTestGameState();
    gameState.player = new HumanPlayer('white');
  });

  it('should return 5 legal moves (no enemies, 1 king)', () => {
    board = new Board();

    gameState.board = board;

     board.place(new Figure('white','king'), parseAlgNotation('e1'));
    // board.place(new Figure('white','rook'), parseAlgNotation('h1'));
    //board.place(new Figure('black','king'), parseAlgNotation('e8'));

    const moves: Move[] = ChessEngine.getMoves(gameState, parseAlgNotation('e1')).map(e => e.move);
    
    const expectedMoves: Move[] = [
      parseMove('e1-d1'),
      parseMove('e1-d2'),
      parseMove('e1-e2'),
      parseMove('e1-f2'),
      parseMove('e1-f1'),
    ];

    expect(moves).to.have.deep.members(expectedMoves);
  });

  it('should return 5 legal moves (1 enemy king on init position)', () => {
    board = new Board();

    gameState.board = board;

     board.place(new Figure('white','king'), parseAlgNotation('e1'));
    // board.place(new Figure('white','rook'), parseAlgNotation('h1'));
    board.place(new Figure('black','king'), parseAlgNotation('e8'));

    const entries: HistoryEntry[] = ChessEngine.getMoves(gameState, parseAlgNotation('e1')); 

    const moves: Move[] = entries.map(e => e.move);
    
    const expectedMoves: Move[] = [
      parseMove('e1-d1'),
      parseMove('e1-d2'),
      parseMove('e1-e2'),
      parseMove('e1-f2'),
      parseMove('e1-f1'),
    ];

    expect(moves).to.have.deep.members(expectedMoves);
  });

  it('should return 0 king moves for start setup', () => {
    const kingPos: Position = ChessEngine['findFigures'](gameState, ['king'], 'white')[0];
    
    const moves: HistoryEntry[] = ChessEngine['getMoves'](gameState, kingPos); 

    expect(moves).to.be.empty;
  });

  it('should return 3 legal moves', () => {
    board = new Board();

    board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('d7'));

    gameState.board = board;

    const legalKingMoves: Move[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e1')).map(e => e.move);

    const expectedMoves: Move[] = [
      parseMove('e1-e2'),
      parseMove('e1-f2'),
      parseMove('e1-f1'),
    ]

    console.log(legalKingMoves);

    expect(legalKingMoves).to.have.lengthOf(expectedMoves.length);

    expect(legalKingMoves).to.have.deep.members(expectedMoves);
  });
});
*/