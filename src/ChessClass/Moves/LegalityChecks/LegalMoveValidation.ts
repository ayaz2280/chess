import { Board } from "../../Board/Board";
import { Figure } from "../../Figure/Figure";
import { getFigure, isFirstMove, isSameMove } from "../../GameStateHelperFunctions";
import { CastlingMoveInfo, ColorType, GameState, HistoryEntry, Move, Position } from "../../types/ChessTypes";
import { getMoveOffset, getPositionRelativeTo, getMove } from "../../utils/MoveUtils";
import { getMoves } from "../MovesGenerator/MovesGenerator";
import { isKingAttackedAfterMove, isKingChecked } from "./KingChecks";

/**
 * Checks if *move* is valid. Method works through searching *move* in result of *getMoves* method, therefore it's strictly **forbidden** to use in *getMoves* method and its alikes, e.g. *getPawnMoves*, *getKnightMoves*, etc
 * @param gameState 
 * @param move 
 * @returns 
 */
function validateMove(gameState: GameState, move: Move): HistoryEntry | null {
  const moves: HistoryEntry[] = getMoves(gameState, move.start);

  const entry: HistoryEntry | undefined = moves.find(mi => isSameMove(move, mi.move));

  if (!entry) return null;

  if (entry.type === 'castling') {
    const castlingEntry: CastlingMoveInfo = entry as CastlingMoveInfo;

    if (isValidCastlingEntry(gameState, castlingEntry)) {
      return castlingEntry;
    }
  }
  if (!isKingAttackedAfterMove(gameState, entry.player.getColor(), entry.move)) {
    return entry;
  }
  return null;
}

function isValidCastlingEntry(gameState: GameState, castlingEntry: CastlingMoveInfo): boolean {
  const board: Board = gameState.board;
  if ('castling' !== castlingEntry.type) {
    return false;
  }
  if (isKingChecked(gameState, castlingEntry.player.getColor())) {
    return false;
  }

  const color: ColorType = castlingEntry.player.getColor();

  const rookPos: Position = castlingEntry.rookMove.start;

  const rook: Figure | null = getFigure(gameState, rookPos);

  if (!rook || castlingEntry.rookPiece !== rook) return false;
  if (!isFirstMove(gameState, rookPos)) {
    return false;
  }

  const kingPos: Position = castlingEntry.move.start;

  const king: Figure | null = getFigure(gameState, kingPos);

  if (!king || castlingEntry.piece !== king) {
    return false;
  }
  if (!isFirstMove(gameState, kingPos)) {
    return false;
  }

  const isKingSideCastling: boolean = getMoveOffset(castlingEntry.move).x > 0;

  let castlingPossible: boolean = true;
  if (isKingSideCastling) {
    for (let i = 1; i <= 2; i++) {
      const posOnPath: Position = getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 }) as Position;

      if (board.isOccupied( posOnPath) || isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), getMove(kingPos, posOnPath))) {
        return false;
      }
    }
  } else {
    for (let i = -1; i >= -3; i--) {
      const posOnPath: Position = getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 }) as Position;

      if (board.isOccupied( posOnPath) || isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), getMove(kingPos, posOnPath))) {
        return false;
      }
    }
  }

  return true;
}

function filterMoves(gameState: GameState, entries: HistoryEntry[]) {
  return entries.filter(entry => validateMove(gameState, entry.move) ? true : false);
}

export { validateMove, isValidCastlingEntry, filterMoves };