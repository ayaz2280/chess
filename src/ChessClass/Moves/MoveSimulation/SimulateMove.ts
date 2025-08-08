
import { isSameMove } from "../../utils/MoveUtils";
import { CastlingMoveInfo, GameState, HistoryEntry, Move } from "../../types/ChessTypes";
import { cloneGameState, getPiecePosition } from "../../utils/gameStateUtils";
import { getMoves } from "../MovesGenerator/MovesGenerator";
import { ChessEngine } from "../../ChessEngine/ChessEngine";

// FUNCTION IS TO BE REVIEWED
/**
   * Simulates a move and returns a new gameState object with move applied
   * @returns a new GameState object or null
   */
  function simulateMove(gameState: GameState, move: Move): GameState | null {
    const newGameState: GameState = cloneGameState(gameState);

    //console.log(newGameState);

    const entry: HistoryEntry | undefined = getMoves(newGameState, move.start).find(e => isSameMove(e.move, move));

    if (!entry) return null;

    ChessEngine.applyMove(newGameState, entry);
    /*

    if (!entry)
      return null;

    const success = newGameState.board.move(move);

    if (!success) {
      return null;
    }

    if (entry.type === 'castling') {
      const castlingEntry: CastlingMoveInfo = entry as CastlingMoveInfo;
      newGameState.board.move(castlingEntry.rookMove);
      newGameState.moveHistory.push(castlingEntry);
    }
    else {
      newGameState.moveHistory.push(entry);
    }
    if (entry.destroyedPiece) {
      const destroyedPiecePos = getPiecePosition(newGameState, entry.destroyedPiece);
      if (destroyedPiecePos) {
        newGameState.board.removePiece(destroyedPiecePos);
      }
    }
      */

    return newGameState;
  }

  export { simulateMove };