import { Board } from "../../src/ChessClass/Board/Board";
import { GameState, HistoryEntry, KingsChecked } from "../../src/ChessClass/types/ChessTypes";
import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";
import { isSameMove } from "../../src/ChessClass/utils/MoveUtils";
import { assert, expect } from "chai";
import { applyMoveDebug } from "../../src/ChessClass/ChessEngine/DebugFunctions";

describe('updateChecks', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    board = new Board();

    board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
    board.place(new Figure('white', 'rook'), parseAlgNotation('a1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('h8'));
    

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid);
    board = gameState.board;
  });

  it('black king should be checked after white rook move (a1-a8)', () => {
    const rookMove: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, parseAlgNotation('a1')).find(e => isSameMove(e.move, parseMove('a1-a8')));

    expect(rookMove).to.be.not.undefined;

    ChessEngine.applyMove(gameState, rookMove!);

    const expectedChecked: KingsChecked = {
      whiteKingChecked: false,
      blackKingChecked: true,
    }

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('black king should be unchecked after escaping rook attack (r a1-a8 k e8-e7)', () => {
    const success: boolean = applyMoveDebug(gameState, parseMove('a1-a8'));

    assert(success === true);

    const blackKingMove: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e8')).find(e => isSameMove(e.move, parseMove('e8-e7')));

    assert(blackKingMove);

    ChessEngine.applyMove(gameState, blackKingMove);

    const expectedChecked: KingsChecked = {
      whiteKingChecked: false,
      blackKingChecked: false,
    }

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('white king should be checked and black king unchecked after series of moves', () => {
    board = new Board();
    board.place(new Figure('black', 'rook'), parseAlgNotation('d8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('d7'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e7'));

    board.place(new Figure('white', 'king'), parseAlgNotation('d1'));
    board.place(new Figure('white', 'rook'), parseAlgNotation('a7'));

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid);
    board = gameState.board;

    let success: boolean;
    const expectedChecked: KingsChecked = {
      whiteKingChecked: false,
      blackKingChecked: true,
    }

    success = applyMoveDebug(gameState, parseMove('a7-d7'));
    assert(success);
    expect(gameState.checked).to.deep.equal(expectedChecked);
    
    expectedChecked.blackKingChecked = false;
    expectedChecked.whiteKingChecked = true;
    applyMoveDebug(gameState, parseMove('d8-d7'));


    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('should update checked on game initialization', () => {
    board = new Board();

    board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('e7'));
    

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid);
    board = gameState.board;

    const expectedChecked: KingsChecked = {
      whiteKingChecked: true,
      blackKingChecked: false,
    }

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('should restore checked after undo move', () => {
    let success: boolean = applyMoveDebug(gameState, parseMove('a1-a8'));

    assert(success);

    const expectedChecked: KingsChecked = {
      whiteKingChecked: false,
      blackKingChecked: true,
    }

    expect(gameState.checked).to.deep.equal(expectedChecked);

    success = ChessEngine.undoLastMove(gameState);

    assert(success);

    expectedChecked.blackKingChecked = false;
    expectedChecked.whiteKingChecked = false;

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });
});