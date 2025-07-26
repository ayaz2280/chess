import { ROOK_OFFSET_PATHS } from "../../../constants";
import { Figure } from "../../../Figure/Figure";
import { getFigure } from "../../../GameStateHelperFunctions";
import { GameState, ActionType, HistoryEntry } from "../../../types/ChessTypes";
import { areAllies } from "../../../utils/gameStateUtils";
import { buildHistoryEntry } from "../../../utils/historyUtils";
import { getPositionRelativeTo, getMove } from "../../../utils/MoveUtils";
import { Position } from "../../MoveTypes";

function getRookMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const moves: HistoryEntry[] = [];
  const piece: Figure | null = getFigure(gameState, pos);

  if (!piece) return moves;


  const pseudoLegalRookPositions: Position[] =
    ROOK_OFFSET_PATHS
      .flatMap(offsetPath => {
        const legitPositions: Position[] = [];
        for (const offset of offsetPath) {
          const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);
          if (!resPos) break;

          const pieceOnSquare: Figure | null = getFigure(gameState, resPos);

          if (pieceOnSquare && areAllies(piece, pieceOnSquare)) {
            break;
          }

          legitPositions.push(resPos);
          if (pieceOnSquare) {
            break;
          }
        }
        return legitPositions;
      });

  for (const endPos of pseudoLegalRookPositions) {
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

export { getRookMoves };