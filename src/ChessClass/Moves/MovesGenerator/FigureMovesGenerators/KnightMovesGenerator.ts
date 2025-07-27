import { KNIGHT_OFFSETS } from '../FigureOffsets';
import { Figure } from "../../../Figure/Figure";
import { GameState, ActionType, HistoryEntry } from "../../../types/ChessTypes";
import { areAllies } from "../../../utils/gameStateUtils";
import { buildHistoryEntry } from "../../../utils/historyUtils";
import { getPositionRelativeTo, getMove } from "../../../utils/MoveUtils";
import { Position, Move } from "../../MoveTypes";
import { Board } from '../../../Board/Board';

function getKnightMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const moves: HistoryEntry[] = [];
  const board: Board = gameState.board;
  const piece: Figure | null = board.getPiece(pos);

  if (!piece) return moves;

  const pseudoLegalKnightPositions: Position[] = KNIGHT_OFFSETS
    .map(a => { return { ...a } })
    .filter(offset => {
      const end: Position | null = getPositionRelativeTo(pos, 'forward', offset);

      if (!end) {
        return false;
      }

      const move: Move = getMove(pos, end);

      const pieceOnSquare: Figure | null = board.getPiece(end);

      if (pieceOnSquare && areAllies(piece, pieceOnSquare)) {
        return false;
      }

      return true;

    })
    .map(offset => {
      return getPositionRelativeTo(pos, 'forward', offset) as Position;
    })

  for (const endPos of pseudoLegalKnightPositions) {
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

  return moves;
}

export { getKnightMoves };