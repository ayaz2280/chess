import { ROOK_OFFSET_PATHS } from '../FigureOffsets';
import { Figure } from "../../../Figure/Figure";
import { GameState, ActionType, HistoryEntry } from "../../../types/ChessTypes";
import { areAllies } from "../../../utils/gameStateUtils";
import { buildHistoryEntry } from "../../../utils/historyUtils";
import { getPositionRelativeTo, getMove } from "../../../utils/MoveUtils";
import { Position } from "../../MoveTypes";
import { Board } from '../../../Board/Board';

function getRookMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
  const moves: HistoryEntry[] = [];
  const board: Board = gameState.board;
  const piece: Figure | null = board.getPiece(pos);

  if (!piece) return moves;


  const pseudoLegalRookPositions: Position[] =
    ROOK_OFFSET_PATHS
      .flatMap(offsetPath => {
        const legitPositions: Position[] = [];
        for (const offset of offsetPath) {
          const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);
          if (!resPos) break;

          const pieceOnSquare: Figure | null = board.getPiece(resPos);

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

export { getRookMoves };