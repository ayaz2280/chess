import { Board, INIT_SETUP_BOARD } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { Position } from "../Moves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";
import { GameState } from "../types/ChessTypes";
import { isSamePos } from "./MoveUtils";
import { positionInGrid } from "./boardUtils";

function isSquareAttackedBy(gameState: GameState, square: Position, attackerSide: ColorType): boolean {
  const board: Board = gameState.board;
  const attackerFigurePositions: Position[] = board.findFigures('all', attackerSide);

  for (const enemyPos of attackerFigurePositions) {
    const piece: Figure = board.getPiece(enemyPos) as Figure;

    const endPositions: Position[] = getMoves(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);

    if (endPositions.find(endP => isSamePos(endP, square))) return true;
  }

  return false;
}

export { isSquareAttackedBy };

