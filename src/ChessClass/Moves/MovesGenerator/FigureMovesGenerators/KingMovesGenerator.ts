import { Board } from "../../../Board/Board";
import { KING_OFFSETS } from '../FigureOffsets';
import { Figure } from "../../../Figure/Figure";

import { HistoryEntry, GameState, CastlingMoveInfo, ActionType } from "../../../types/ChessTypes";
import { areAllies, containsInitialFigure, getDirection } from "../../../utils/gameStateUtils";

import { buildHistoryEntry } from "../../../utils/historyUtils";
import { getPositionRelativeTo, getMove } from "../../../utils/MoveUtils";
import { Position, Direction, Move } from "../../MoveTypes";
import { isFirstMove } from "../../../utils/gameStateMovementUtils";

function getKingMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const moves: HistoryEntry[] = [];
  const board: Board = gameState.board;
  const piece: Figure | null = board.getPiece(pos);

  if (!piece) return moves;

  const pseudoLegalKingPositions: Position[] =
    KING_OFFSETS
      .flatMap(offset => {
        const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);

        if (!resPos) return [];

        const pieceOnSquare: Figure | null = board.getPiece(resPos);

        if (pieceOnSquare && areAllies(piece, pieceOnSquare)) return [];

        return [resPos];
      });

  for (const endPos of pseudoLegalKingPositions) {
    const destroyedPiece: Figure | null = board.getPiece(endPos);

    if (!destroyedPiece && (!types || types.includes('move'))) {
      moves.push(
        buildHistoryEntry(gameState, getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
      );
    }

    if (destroyedPiece && (!types || types.includes('attackMove'))) {
      moves.push(
        buildHistoryEntry(gameState, getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
      );
    }
  }

  if (!types || types.includes('castling')) {
    moves.push(...getCastlingMoves(gameState, pos));
  }

  return moves;
}

function getCastlingMoves(gameState: GameState, kingPos: Position): HistoryEntry[] {
  const board: Board = gameState.board;
  const moves: CastlingMoveInfo[] = [];

  const piece: Figure | null = board.getPiece(kingPos);

  if (!piece || piece.getPiece() !== 'king') {
    return moves;
  }

  if (!isFirstMove(gameState, kingPos)) {
    return moves;
  }

  // Checking if rooks are on their places
  const dir: Direction = getDirection(gameState, piece);

  const [leftRookInitPos, rightRookInitPos] = [
    getPositionRelativeTo(kingPos, 'forward', { x: -4, y: 0 }) as Position,
    getPositionRelativeTo(kingPos, 'forward', { x: 3, y: 0 }) as Position,
  ]

  const [leftRookOnPlace, rightRookOnPlace] = [containsInitialFigure(gameState, leftRookInitPos), containsInitialFigure(gameState, rightRookInitPos)];

  // Checking the path

  let castlingPossible: boolean = true;
  if (leftRookOnPlace) {
    for (let i = 1; i <= 3; i++) {
      const posOnPath: Position = getPositionRelativeTo(kingPos, 'forward', { x: -1 * i, y: 0 }) as Position;

      if (board.isOccupied( posOnPath)) {
        castlingPossible = false;
        break;
      }
    }

    if (castlingPossible) {
      const move: Move = getMove(kingPos, getPositionRelativeTo(kingPos, 'forward', { x: -2, y: 0 }) as Position);
      moves.push(
        buildHistoryEntry(
          gameState,
          move,
          null,
          'castling', { isPromotion: false }) as CastlingMoveInfo
      );
    }
  }

  castlingPossible = true;
  if (rightRookOnPlace) {
    for (let i = 1; i <= 2; i++) {
      const posOnPath: Position = getPositionRelativeTo(kingPos, 'forward', { x: i, y: 0 }) as Position;

      if (board.isOccupied( posOnPath)) {
        castlingPossible = false;
        break;
      }
    }

    if (castlingPossible) {
      const move: Move = getMove(kingPos, getPositionRelativeTo(kingPos, 'forward', { x: 2, y: 0 }) as Position);
      moves.push(
        buildHistoryEntry(
          gameState,
          move,
          null,
          'castling', { isPromotion: false }) as CastlingMoveInfo
      );
    }
  }


  return moves;
}

export { getKingMoves };