import { Board } from "../Board/Board";
import { parseMove } from "../LegacyMoves/AlgNotation/AlgNotation";
import { Position } from "../LegacyMoves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";
import { GameState, HistoryEntry, CastlingRights } from "../types/ChessTypes";
import { isFirstMove } from "./gameStateMovementUtils";

import { getMoveOffset, getPositionRelativeTo, isSamePos } from "./MoveUtils";

function getEnPassantFile(gameState: GameState): number | null {
  if (gameState.moveHistory.length === 0) return null;

  const lastEntry: HistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
  const moveOffset: Position = getMoveOffset(lastEntry.move);

  if (lastEntry.piece.getPiece() !== 'pawn' || !(Math.abs(moveOffset.y) === 2 && Math.abs(moveOffset.x) === 0)) {
    return null;
  }

  const file: number = lastEntry.move.end.x;

  return file;
}

function requestCastlingRights(gameState: GameState): CastlingRights {
  const board: Board = gameState.board;

  const whiteKingPositions: Position[] = board.findFigures(['king'], 'white');
  const blackKingPositions: Position[] = board.findFigures(['king'], 'black');

  if (whiteKingPositions.length !== 1 || blackKingPositions.length !== 1) {
    return {
      white: { 'kingSide': false, 'queenSide': false },
      black: { 'kingSide': false, 'queenSide': false },
    }
  }

  const whiteKingPos: Position = whiteKingPositions[0];
  const blackKingPos: Position = blackKingPositions[0];

  const castlingRights: CastlingRights = {
    white: {
      queenSide: hasCastlingRight(gameState, 'white', 'queenSide'),
      kingSide: hasCastlingRight(gameState, 'white', 'kingSide'),
    },
    black: {
      queenSide: hasCastlingRight(gameState, 'black', 'queenSide'),
      kingSide: hasCastlingRight(gameState, 'black', 'kingSide'),
    }
  }

  return castlingRights;
}

/**
   * Returns whether the king of *playerColor* may castle from *side* now or in the future.
   * @param gameState 
   * @param playerColor 
   * @param side 
   * @returns 
   */
function hasCastlingRight(gameState: GameState, playerColor: ColorType, side: 'kingSide' | 'queenSide'): boolean {
  const board: Board = gameState.board;

  const kingPos: Position = board.findFigures(['king'], playerColor)[0];

  if (!isFirstMove(gameState, kingPos)) {
    return false;
  }

  const expectedRookPos: Position = getPositionRelativeTo(kingPos, 'forward', side === 'kingSide' ? getMoveOffset(parseMove('e1-h1')) : getMoveOffset(parseMove('e1-a1'))) as Position;

  const rookPos: Position | undefined = board.findFigures(['rook'], playerColor).find(pos => isSamePos(expectedRookPos, pos));

  if (!rookPos) return false;

  if (!isFirstMove(gameState, rookPos)) return false;

  return true;
}

export { getEnPassantFile, requestCastlingRights, hasCastlingRight };