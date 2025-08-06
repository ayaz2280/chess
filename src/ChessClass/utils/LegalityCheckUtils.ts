import { Board, INIT_SETUP_BOARD } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { Position } from "../Moves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";
import { CheckInfo, GameState, HistoryEntry } from "../types/ChessTypes";
import { isSamePos } from "./MoveUtils";
import { positionInGrid } from "./boardUtils";
import { assert } from "chai";

function isSquareAttackedBy(gameState: GameState, square: Position, attackerSide: ColorType, checkInfo?: CheckInfo, attackerMovesStorage?: HistoryEntry[]): boolean {
  const board: Board = gameState.board;
  const attackerFigurePositions: Position[] = board.findFigures('all', attackerSide);
  let found: boolean = false;

  if (attackerMovesStorage) {
    if (attackerMovesStorage.length !== 0) {
      throw new Error(`Enemy positions storage must be empty, in fact got length ${attackerMovesStorage.length}`);
    }
  }

  for (const enemyPos of attackerFigurePositions) {
    const piece: Figure = board.getPiece(enemyPos) as Figure;

    const attackerMoves: HistoryEntry[] = getMoves(gameState, enemyPos, ['attackMove']);
    let moveID: number;
    const endPositions: Position[] = attackerMoves.map(entry => entry.move.end);

    if (endPositions.find((endP, id) => {
      const success: boolean = isSamePos(endP, square);
      if (success) {
        moveID = id;
      }
      return success;
    })) {
      found = true;
      if (!checkInfo && !attackerMovesStorage) {
        return true;
      }

      if (checkInfo) {
        checkInfo.checkingPieces.push({
          piece: piece,
          pos: enemyPos
        });
      }
      
      if (attackerMovesStorage) {
        attackerMovesStorage.push(attackerMoves[moveID!]);
      }
    }
  }

  return found;
}

export { isSquareAttackedBy };

