import { INIT_SETUP_BOARD } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { Position } from "../LegacyMoves/MoveTypes";
import { GameState } from "../types/ChessTypes";
import { positionInGrid } from "./boardUtils";

export function isFirstMove(gameState: GameState, pos: Position): boolean {
  const piece: Figure | null = gameState.board.getPiece(pos);

  if (!piece) return false;

  const moveHistory = gameState.moveHistory;

  for (let entry of moveHistory) {
    if (piece === entry.piece) {
      return false;
    }
  }

  return true && onInitPosition(gameState, pos);
}

export function onInitPosition(gameState: GameState, pos: Position): boolean {
  if (!positionInGrid(pos)) return false;

  const piece: Figure | null = gameState.board.getPiece(pos);
  const pieceOnSetupBoard: Figure | null = INIT_SETUP_BOARD.grid[pos.y][pos.x];

  if (!piece || !pieceOnSetupBoard) return false;

  return piece.getPiece() === pieceOnSetupBoard.getPiece() && piece.getColor() === pieceOnSetupBoard.getColor();
}