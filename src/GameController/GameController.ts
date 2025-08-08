import { GameState, HistoryEntry, Move } from "../ChessClass/types/ChessTypes";
import { InitGameInfo } from "../ChessClass/types/InitGameTypes";
import { ChessEngine } from "../ChessClass/ChessEngine/ChessEngine";
import { listCachedMoves } from "./utils";
import { isSameMove } from "../ChessClass/utils/MoveUtils";
import { updateChecks } from "../ChessClass/Moves/LegalityChecks/KingChecks";
import { updateGameStatus } from "../ChessClass/utils/GameStatusUtils";

class GameController {
  static startGame(gameInfo: InitGameInfo): GameState {
    return ChessEngine.initGame(gameInfo);
  }

  // checks if the move among the legal moves, and if it is, applies a move. otherwise does nothing
  static makeMove(gameState: GameState, move: Move): boolean {
    const legalMoves: HistoryEntry[] = listCachedMoves();

    const legalMove: HistoryEntry | undefined = legalMoves.find(e => isSameMove(move, e.move));

    if (legalMove === undefined) {
      return false;
    }

    ChessEngine.applyMove(gameState, legalMove);

    updateChecks(gameState);

    ChessEngine.updateLegalMovesCache(gameState);

    updateGameStatus(gameState);

    return true;
  }

  static unmakeMove(gameState: GameState): void {
    ChessEngine.undoLastMove(gameState);
  }
}