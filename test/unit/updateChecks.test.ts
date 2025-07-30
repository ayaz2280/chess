import { Board } from "../../src/ChessClass/Board/Board";
import { GameState, HistoryEntry, KingsChecked, Position } from "../../src/ChessClass/types/ChessTypes";
import { ChessEngine } from "../../src/ChessClass/ChessEngine/ChessEngine";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/Moves/AlgNotation/AlgNotation";
import { isSameMove } from "../../src/ChessClass/utils/MoveUtils";
import { assert, expect } from "chai";
import { applyMoveDebug } from "../../src/ChessClass/ChessEngine/DebugFunctions";
import { getCurrentKingCheckStatus } from "../../src/ChessClass/utils/gameStateUtils";

describe('updateChecks', () => {
  let gameState: GameState;
  let board: Board;
  let expectedChecked: KingsChecked;

  beforeEach(() => {
    board = new Board();

    board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
    board.place(new Figure('white', 'rook'), parseAlgNotation('a1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('h8'));
    

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid);
    board = gameState.board;

    expectedChecked = {
      whiteKingChecked: {checkingPieces: []},
      blackKingChecked: {checkingPieces: []},
    }
  });

  it('black king should be checked after white rook move (a1-a8)', () => {
    const rookMove: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, parseAlgNotation('a1')).find(e => isSameMove(e.move, parseMove('a1-a8')));

    expect(rookMove).to.be.not.undefined;

    ChessEngine.applyMove(gameState, rookMove!);

    const rookPos: Position = parseAlgNotation('a8');

    expectedChecked.blackKingChecked.checkingPieces = [
      {
        piece: board.getPiece(rookPos) as Figure,
        pos: rookPos, 
      }
    ]

    console.log(getCurrentKingCheckStatus(gameState));

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('black king should be unchecked after escaping rook attack (r a1-a8 k e8-e7)', () => {
    const success: boolean = applyMoveDebug(gameState, parseMove('a1-a8'));

    assert(success === true);

    const blackKingMove: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e8')).find(e => isSameMove(e.move, parseMove('e8-e7')));

    assert(blackKingMove);

    ChessEngine.applyMove(gameState, blackKingMove);

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

    const whiteRookPiecePos: Position = parseAlgNotation('d7');

    let success: boolean;
    

    success = applyMoveDebug(gameState, parseMove('a7-d7'));
    assert(success);

    expectedChecked = {
      whiteKingChecked: {checkingPieces: []},
      blackKingChecked: {checkingPieces: [
        {
          piece: board.getPiece(whiteRookPiecePos) as Figure,
          pos: whiteRookPiecePos,
        }
      ]},
    }

    expect(gameState.checked).to.deep.equal(expectedChecked);
    
    
    applyMoveDebug(gameState, parseMove('d8-d7'));
    expectedChecked.blackKingChecked.checkingPieces = [];
    expectedChecked.whiteKingChecked.checkingPieces = [{
      piece: board.getPiece(whiteRookPiecePos) as Figure,
      pos: whiteRookPiecePos,
    }];

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('should update checked on game initialization', () => {
    board = new Board();

    board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
    board.place(new Figure('black', 'king'), parseAlgNotation('e8'));
    board.place(new Figure('black', 'rook'), parseAlgNotation('e7'));

    const rookPos: Position = parseAlgNotation('e7');
    

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid);
    board = gameState.board;

    expectedChecked.whiteKingChecked.checkingPieces.push({
      piece: board.getPiece(rookPos)!,
      pos: rookPos,
    });

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('should restore checked after undo move', () => {
    let success: boolean = applyMoveDebug(gameState, parseMove('a1-a8'));

    assert(success);

    const rookPos: Position = parseAlgNotation('a8');

    expectedChecked.blackKingChecked.checkingPieces = [{
      piece: board.getPiece(rookPos)!,
      pos: rookPos,
    }]

    expect(gameState.checked).to.deep.equal(expectedChecked);

    success = ChessEngine.undoLastMove(gameState);

    assert(success);

    expectedChecked.blackKingChecked.checkingPieces = [];
    expectedChecked.whiteKingChecked.checkingPieces = [];

    expect(gameState.checked).to.deep.equal(expectedChecked);
  });

  it('should keep info about double check pieces correctly', () => {
    board.place(new Figure('white', 'knight'), parseAlgNotation('f6'));
    board.move(parseMove('a1-a8'));

    gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid, 'black');

    board = gameState.board;

    expectedChecked.blackKingChecked.checkingPieces = [
      {
        pos: parseAlgNotation('a8'),
        piece: board.getPiece(parseAlgNotation('a8'))!,
      }, {
        pos: parseAlgNotation('f6'),
        piece: board.getPiece(parseAlgNotation('f6'))!,
      }
    ];

    expect(gameState.checked.whiteKingChecked.checkingPieces).to.be.empty;
    expect(gameState.checked.blackKingChecked.checkingPieces).to.have.lengthOf(2);
    expect(gameState.checked.blackKingChecked.checkingPieces).to.have.deep.members(expectedChecked.blackKingChecked.checkingPieces);
  });
});