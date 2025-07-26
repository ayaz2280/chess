import { Direction, Move, Position } from "../Moves/MoveTypes";
import { Figure } from "../Figure/Figure";
import { ColorType, GameState, HistoryEntry } from "../types/ChessTypes";
import { Player } from "../Player/Player";
import { findFigures, getFigure, isSamePos } from "../GameStateHelperFunctions";
import { getPositionRelativeTo } from "./MoveUtils";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { getSideToMoveNumber } from "../HelperFunctions";

function getDirection(gameState: GameState, piece: Figure): Direction {
  return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
}

function getPlayer(gameState: GameState, color: ColorType): Player {
  return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
}

function isRankEndOfBoard(gameState: GameState, rank: number, side: ColorType): boolean {
  return gameState.player.getColor() === side ? rank === 7 : rank === 0;
}

function canAttackSquare(gameState: GameState, attackerPos: Position, squareToAttack: Position, attackingOffset: Position): boolean {
  const piece: Figure | null = getFigure(gameState, attackerPos);

  if (!piece) return false;

  const piece2: Figure | null = getFigure(gameState, squareToAttack);

  if (!piece2) return false;

  if (areAllies(piece, piece2)) return false;

  const calculatedSquare: Position | null = getPositionRelativeTo(attackerPos, getDirection(gameState, piece), attackingOffset);

  if (!calculatedSquare || !isSamePos(calculatedSquare, squareToAttack)) return false;

  return true;
}

function areAllies(p1: Figure, p2: Figure): boolean {
  return p1.getColor() === p2.getColor();
}

/**
 * Checks if piece from *initPos* has ever moved from the start of the game.
 * @param gameState 
 * @param initPos 
 */
function containsInitialFigure(gameState: GameState, initPos: Position): boolean {
  if (gameState.moveHistory.length === 0) {
    return getFigure(gameState, initPos) ? true : false;
  }

  if (gameState.moveHistory[0].board.getPiece(initPos) === gameState.board.getPiece(initPos))
    return true;
  return false;
}

function nextSideToMove(gameState: GameState): ColorType {
  const moveHistory = gameState.moveHistory;
  if (moveHistory.length === 0) {
    return 'white';
  }

  const lastEntry: HistoryEntry = moveHistory[moveHistory.length - 1];

  return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
}

function isPieceOnEndOfBoard(gameState: GameState, pos: Position): boolean {
  const piece: Figure | null = getFigure(gameState, pos);

  if (!piece) {
    return false;
  }

  const dir: Direction = getDirection(gameState, piece);

  return getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) ? false : true;
}

function isSquareAttackedBy(gameState: GameState, square: Position, attackerSide: ColorType): boolean {
  const attackerFigurePositions: Position[] = findFigures(gameState, 'all', attackerSide);

  for (const enemyPos of attackerFigurePositions) {
    const piece: Figure = getFigure(gameState, enemyPos) as Figure;

    const endPositions: Position[] = getMoves(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);

    if (endPositions.find(endP => isSamePos(endP, square))) return true;
  }

  return false;
}

function getPiecePosition(gameState: GameState, piece: Figure): Position | null {
  for (let y = 0; y <= 7; y++) {
    for (let x = 0; x <= 7; x++) {
      if (piece === gameState.board.grid[y][x]) {
        return { x: x, y: y };
      }
    }
  }
  return null;
}

function flipSideToMove(gameState: GameState): void {
  gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
  gameState.hash! ^= getSideToMoveNumber();
}

function getDestroyedPiece(gameState: GameState, attackerPiece: Figure, move: Move): Figure | null {
  if (!attackerPiece) return null;

  const player: Player = getPlayer(gameState, attackerPiece.getColor());

  const pieceToBeDestroyed: Figure | null = getFigure(gameState, move.end);

  if (!pieceToBeDestroyed) return null;

  if (areAllies(attackerPiece, pieceToBeDestroyed)) return null;

  return pieceToBeDestroyed;
}

export { getDirection, getPlayer,  isRankEndOfBoard, canAttackSquare, areAllies, containsInitialFigure, nextSideToMove, isPieceOnEndOfBoard, isSquareAttackedBy, getPiecePosition, flipSideToMove, getDestroyedPiece };