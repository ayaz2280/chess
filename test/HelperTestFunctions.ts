import { assert } from "chai";
import { Board } from "../src/ChessClass/Board/Board";
import { ChessEngine } from "../src/ChessClass/ChessEngine/ChessEngine";
import { posToAlgNotation, styled } from "../src/ChessClass/HelperFunctions";
import { HumanPlayer, ComputerPlayer } from "../src/ChessClass/Player/Player";
import { ColorType, GameState, HistoryEntry, Position } from "../src/ChessClass/types/ChessTypes";
import { ChessGrid } from "../src/ChessClass/Board/BoardTypes";
import { getEnPassantFile, requestCastlingRights } from "../src/ChessClass/GameStateHelperFunctions";

const createTestGameState = (boardGrid?: ChessGrid, currentPlayerColor: ColorType = 'white'): GameState => {
  const board = new Board();
  if (boardGrid) {
    board.grid = boardGrid; // Directly set grid for specific scenarios
  } else {
    // Default empty board or initial setup
    ChessEngine.setupBoard(board); // Use actual setup for realism
  }

  const gameState: GameState =  {
    player: currentPlayerColor === 'white' ? new HumanPlayer('white') : new ComputerPlayer('white'),
    opponent: currentPlayerColor === 'white' ? new ComputerPlayer('black') : new HumanPlayer('black'),
    board: board,
    moveHistory: [],
    checked: {
      whiteKingChecked: false,
      blackKingChecked: false,
    },
    castlingRights: {
      white: {
        kingSide: true,
        queenSide: true,
      },
      black: {
        kingSide: true,
        queenSide: true,
      }
    },
    enPassantTargetFile: null,
    halfMoveClock: 0,
    sideToMove: currentPlayerColor,
    fullMoveCounter: 1,
  };
  gameState.castlingRights = requestCastlingRights(gameState);
  gameState.enPassantTargetFile = getEnPassantFile(gameState);

  return gameState;
};

 const printEntries = (entries: HistoryEntry[]): void => {
  entries.forEach((e, id) => {
    console.log(`#${id} Entry`);
    console.log(`\ttype: ${styled(e.type, 32)}`);
    console.log(`\tplayer: ${styled(e.player.getColor(), 32)}`);
    console.log(`\tpiece: ${styled(e.piece.getColor(), 32)}, ${styled(e.piece.getPiece(), 32)}`);
    console.log(`\tmove: ${styled(posToAlgNotation(e.move.start), 32)}${styled('-', 32)}${styled(posToAlgNotation(e.move.end), 32)}`);
    console.log(`\tdestroyedPiece: ${styled(e.destroyedPiece ? `${e.destroyedPiece.getColor()}, ${e.destroyedPiece.getPiece()}` : 'null', 32)}`);
  })
} 

function perft(gameState: GameState, depth: number): number {
  assert(Number.isInteger(depth));

  if (depth === 0) {
    return 0;
  }

  let movesCount: number = 0;

  const figPositions: Position[] = ChessEngine['findFigures'](gameState, 'all', 'both');

  figPositions.forEach(pos => {
    const entries: HistoryEntry[] = ChessEngine['getLegalMoves'](gameState, pos);

    movesCount += entries.length;

    entries.forEach(entry => {
      ChessEngine['applyMove'](gameState, entry);
      movesCount += perft(gameState, depth-1);
      ChessEngine['undoLastMove'](gameState);
    })
  });

  return movesCount;
}

export {perft, createTestGameState, printEntries};