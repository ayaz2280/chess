import { Board, INIT_SETUP_BOARD } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { Position } from "../Moves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";
import { CheckInfo, GameState } from "../types/ChessTypes";
import { isSamePos } from "./MoveUtils";
import { positionInGrid } from "./boardUtils";

function isSquareAttackedBy(gameState: GameState, square: Position, attackerSide: ColorType, checkInfo?: CheckInfo): boolean {
  const board: Board = gameState.board;
  const attackerFigurePositions: Position[] = board.findFigures('all', attackerSide);
  let found: boolean = false;

  for (const enemyPos of attackerFigurePositions) {
    const piece: Figure = board.getPiece(enemyPos) as Figure;

    const endPositions: Position[] = getMoves(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);

    if (endPositions.find(endP => isSamePos(endP, square))) {
      found = true;
      if (checkInfo) {
        checkInfo.checkingPieces.push({
          piece: piece,
          pos: enemyPos
        });
      } else {
        return true;
      }
    }
  }

  return found;
}

export { isSquareAttackedBy };

