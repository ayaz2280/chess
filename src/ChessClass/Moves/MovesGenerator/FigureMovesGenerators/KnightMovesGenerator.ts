import { KNIGHT_OFFSETS } from "../../../constants";
import { Figure } from "../../../Figure/Figure";
import { getFigure } from "../../../GameStateHelperFunctions";
import { GameState, ActionType, HistoryEntry } from "../../../types/ChessTypes";
import { areAllies } from "../../../utils/gameStateUtils";
import { buildHistoryEntry } from "../../../utils/historyUtils";
import { getPositionRelativeTo, getMove } from "../../../utils/MoveUtils";
import { Position, Move } from "../../MoveTypes";

function getKnightMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const moves: HistoryEntry[] = [];
  const piece: Figure | null = getFigure(gameState, pos);

  if (!piece) return moves;

  const pseudoLegalKnightPositions: Position[] = KNIGHT_OFFSETS
    .map(a => { return { ...a } })
    .filter(offset => {
      const end: Position | null = getPositionRelativeTo(pos, 'forward', offset);

      if (!end) {
        return false;
      }

      const move: Move = getMove(pos, end);

      const pieceOnSquare: Figure | null = getFigure(gameState, end);

      if (pieceOnSquare && areAllies(piece, pieceOnSquare)) {
        return false;
      }

      return true;

    })
    .map(offset => {
      return getPositionRelativeTo(pos, 'forward', offset) as Position;
    })

  for (const endPos of pseudoLegalKnightPositions) {
    const destroyedPiece: Figure | null = getFigure(gameState, endPos);

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