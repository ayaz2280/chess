import { assert, expect } from "chai";
import { Board } from "../../src/ChessClass/Board";
import { ChessEngine } from "../../src/ChessClass/ChessEngine";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/HelperFunctions";
import { GameState, Move, Position } from "../../src/ChessClass/types/ChessTypes";
import { createTestGameState } from "../HelperTestFunctions";
import { Figure } from "../../src/ChessClass/Figure/Figure";

Error.stackTraceLimit = 5;

describe('simulateMove()', () => {
  let gameState: GameState;
  let board: Board;

  beforeEach(() => {
    gameState = createTestGameState();
  });

  it('should apply pawn move correctly (a2-a4)', () => {

    const move: Move = parseMove('a2-a4');

    const newGameState: GameState | null = ChessEngine['simulateMove'](gameState, move);

    assert(newGameState !== null);

    const pieceAgain: Figure | null = newGameState.board.getPiece(parseAlgNotation('a4'));

    assert(pieceAgain !== null);

    expect(pieceAgain.getPiece()).to.equal('pawn');
    expect(newGameState.board.getPiece(parseAlgNotation('a2'))).to.equal(null);
  });

  it("shouldn't apply illegal pawn move (a2-a5)", () => {
    const move: Move = parseMove('a2-a5');

    const newGameState: GameState | null = ChessEngine['simulateMove'](gameState, move);

    expect(newGameState).to.equal(null);
  });

  it("should apply castling move for white king", () => {
    gameState.board.removePiece(parseAlgNotation('f1'));
    gameState.board.removePiece(parseAlgNotation('g1'));

    const move: Move = parseMove('e1-g1');

    const newGameState: GameState | null = ChessEngine['simulateMove'](gameState, move);

    assert(newGameState !== null);

    const kingPos: Position = parseAlgNotation('g1');
    const rookPos: Position = parseAlgNotation('f1');

    const king: Figure | null = newGameState.board.getPiece(parseAlgNotation('g1'));
    const rook: Figure | null = newGameState.board.getPiece(parseAlgNotation('f1'));

    assert(king !== null);
    assert(rook !== null);

    expect(king.getPiece()).to.equal('king');
    expect(rook.getPiece()).to.equal('rook');
  });
});