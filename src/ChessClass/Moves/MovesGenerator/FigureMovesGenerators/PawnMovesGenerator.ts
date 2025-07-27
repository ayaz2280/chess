import { Board } from "../../../Board/Board";
import { Figure } from "../../../Figure/Figure";

import { ActionType, GameState, HistoryEntry, Move, Position } from "../../../types/ChessTypes";
import { Direction } from "../../MoveTypes";
import { getMove, getMoveOffset, getPositionRelativeTo } from "../../../utils/MoveUtils";
import { buildHistoryEntry } from "../../../utils/historyUtils";
import { canAttackSquare, getDirection, isRankEndOfBoard } from "../../../utils/gameStateUtils";
import { isFirstMove } from "../../../utils/LegalityCheckUtils";
import { FigureType } from "../../../Figure/FigureTypes";

function getPawnMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const board: Board = gameState.board;
  const piece: Figure | null = board.grid[pos.y][pos.x];
  let entry: HistoryEntry | null;
  let move: Move;

  if (!piece || !(piece.getPiece() === 'pawn')) return [];

  const moves: HistoryEntry[] = [];

  const dir: Direction = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';

  let isPromotionMove: boolean = false;

  // moves of type 'move'
  if (
    !types ||
    types.includes('move')
  ) {
    if (isFirstMove(gameState, pos)) {
      const offset: Position = {
        x: 0,
        y: 2,
      }
      const twoSquareAhead: Position = getPositionRelativeTo(pos, dir, offset) as Position;

      const oneSquareAhead: Position = getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) as Position;

      if (
        twoSquareAhead &&
        !board.isOccupied(twoSquareAhead) &&
        !board.isOccupied(oneSquareAhead)
      ) {
        move = getMove(pos, twoSquareAhead);
        entry = buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

        if (entry) {
          moves.push(entry);
        }
      }
    }

    // check for 1 square move
    const oneSquareAhead: Position | null = getPositionRelativeTo(pos, dir, {
      x: 0,
      y: 1,
    });

    if (oneSquareAhead) {
      const moveOneSquare: Move = {
        start: pos,
        end: oneSquareAhead,
      };
      if (!board.isOccupied(oneSquareAhead)) {
        move = getMove(pos, oneSquareAhead);

        if (isRankEndOfBoard(gameState, oneSquareAhead.y, piece.getColor())) {
          const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

          figureTypes.forEach((figType) => {
            entry = buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });

            if (entry) {
              moves.push(entry);
            }
          });
        } else {
          entry = buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

          if (entry) {
            moves.push(entry);
          }
        }
      }
    }
  }

  // moves of type 'attackMove'
  if (
    !types ||
    types.includes('attackMove')
  ) {
    // check for diagonal attacking moves
    const leftDiagonalOffset: Position = {
      x: -1,
      y: 1,
    };

    const rightDiagonalOffset: Position = {
      x: 1,
      y: 1,
    };

    const leftDiagonal: Position | null = getPositionRelativeTo(pos, dir, leftDiagonalOffset);

    const rightDiagonal: Position | null = getPositionRelativeTo(pos, dir, rightDiagonalOffset);

    if (leftDiagonal) {
      if (canAttackSquare(gameState, pos, leftDiagonal, leftDiagonalOffset)) {
        move = getMove(pos, leftDiagonal);

        if (isRankEndOfBoard(gameState, leftDiagonal.y, piece.getColor())) {
          const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

          figureTypes.forEach((figType) => {
            entry = buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });

            if (entry) {
              moves.push(entry);
            }
          });
        } else {
          entry = buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

          if (entry) {
            moves.push(entry);
          }
        }
      }
    }

    if (rightDiagonal) {
      if (canAttackSquare(gameState, pos, rightDiagonal, rightDiagonalOffset)) {
        move = getMove(pos, rightDiagonal);
        const destroyedPiece: Figure = board.getPiece(move.end) as Figure;

        if (isRankEndOfBoard(gameState, rightDiagonal.y, piece.getColor())) {
          const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

          figureTypes.forEach((figType) => {
            entry = buildHistoryEntry(gameState, move, destroyedPiece, 'attackMove', { isPromotion: true, promotedTo: figType });

            if (entry) {
              moves.push(entry);
            }
          });
        } else {
          entry = buildHistoryEntry(gameState, move, destroyedPiece, 'attackMove', { isPromotion: false });

          if (entry) {
            moves.push(entry);
          }
        }
      }
    }

  }

  // moves of type en passant
  if (!types || types.includes('enPassant')) {
    const enPassantPos: Position | null = getEnPassantPos(gameState, pos);

    if (enPassantPos) {
      move = getMove(pos, enPassantPos);
      entry = buildHistoryEntry(gameState, move, board.getPiece(getPositionRelativeTo(enPassantPos, dir, { x: 0, y: -1 }) as Position), 'enPassant', { isPromotion: false });

      if (entry) {
        moves.push(entry);
      }
    }
  }

  return moves;
}

function getEnPassantPos(gameState: GameState, pos: Position): Position | null {
  const board: Board = gameState.board;
  const piece: Figure | null = board.getPiece(pos);

  if (!piece || piece.getPiece() !== 'pawn') return null;
  if (gameState.moveHistory.length === 0) return null;

  const dir: Direction = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';

  const leftOffset: Position = {
    x: -1,
    y: 0,
  };

  const rightOffset: Position = {
    x: 1,
    y: 0,
  };

  const leftPos: Position | null = getPositionRelativeTo(pos, dir, leftOffset);

  const rightPos: Position | null = getPositionRelativeTo(pos, dir, rightOffset);

  const lastHistoryEntry: HistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];

  const moveOffset: Position = getMoveOffset(lastHistoryEntry.move, getDirection(gameState, lastHistoryEntry.piece));
  if (
    lastHistoryEntry.piece.getPiece() !== 'pawn' ||
    !(moveOffset.x === 0 && moveOffset.y === 2)
  ) {

    return null;
  }

  if (leftPos) {
    const leftPawn: Figure | null = board.getPiece(leftPos);

    if (leftPawn && leftPawn === lastHistoryEntry.piece) {
      const enPassantOffset: Position = { x: -1, y: 1 };
      const enPassantPos: Position = getPositionRelativeTo(pos, dir, enPassantOffset) as Position;
      const enPassantMove: Move = {
        start: pos,
        end: enPassantPos,
      }
      return enPassantPos;
    }
  }

  if (rightPos) {
    const rightPawn: Figure | null = board.getPiece(rightPos);

    if (rightPawn && rightPawn === lastHistoryEntry.piece) {
      const enPassantOffset: Position = { x: 1, y: 1 };
      const enPassantPos: Position = getPositionRelativeTo(pos, dir, enPassantOffset) as Position;
      const enPassantMove: Move = {
        start: pos,
        end: enPassantPos,
      }

      return enPassantPos;
    }
  }
  return null;
}

export { getPawnMoves, getEnPassantPos }
