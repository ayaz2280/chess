
import { ColorType } from "../../Player/PlayerTypes";
import { GameState, HistoryEntry, Move, Position } from "../../types/ChessTypes";
import { cloneGameState, nextSideToMove } from "../../utils/gameStateUtils";
import { buildHistoryEntry } from "../../utils/historyUtils";
import { isSquareAttackedBy } from "../../utils/LegalityCheckUtils";
import { getMove } from "../../utils/MoveUtils";
import { simulateMove } from "../MoveSimulation/SimulateMove";

/**
 * Checks if *isKingAttacked* if *side* will not make any move
 */
function isKingChecked(gameState: GameState, side: ColorType): boolean {
  const turn: ColorType = nextSideToMove(gameState);

  if (turn !== side) {
    throw new Error(`It's not ${side}'s turn to make a move!`);
  }

  const newGameState: GameState = cloneGameState(gameState);
  const kingPos: Position = newGameState.board.findFigures(['king'], side)[0];

  // placing a dummy entry
  newGameState.moveHistory.push(
    buildHistoryEntry(
      newGameState,
      getMove({ ...kingPos }, { ...kingPos }),
      null,
      'move',
      { isPromotion: false }
    ) as HistoryEntry
  );

  return isKingAttacked(newGameState, side);
}

/*
  To check if the king of the given color is under attack, we need to check if a king's square is attacked.

  The king is considered under attack, if its square is immediately captured on the next opponent's move, and it's opponent's turn to make a move.
*/
function isKingAttacked(gameState: GameState, color: ColorType): boolean {
  const sideToMove: ColorType = nextSideToMove(gameState);
  const opponentColor: ColorType = color === 'white' ? 'black' : 'white';

  if (sideToMove !== opponentColor) {
    return false;
  }

  const figPositions: Position[] = gameState.board.findFigures(['king'], color);

  if (figPositions.length === 0) {
    return false;
  }

  const kingPos: Position = figPositions[0];


  return isSquareAttackedBy(gameState, kingPos, opponentColor);
}

/**
 * Simulates a move and checks if king's checked after the move's made
 * @param gameState 
 * @param color 
 * @param move 
 * @returns 
 */
function isKingAttackedAfterMove(gameState: GameState, color: ColorType, move: Move): boolean {
  const newGameState: GameState | null = simulateMove(gameState, move);

  if (!newGameState) {
    throw new Error('Move`s not possible to simulate');
  }

  return isKingAttacked(newGameState, color);
}

export { isKingChecked, isKingAttackedAfterMove };