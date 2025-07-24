import { inRange } from "../HelperFunctions";
import { Direction, Move, Position } from "./MoveTypes";

/**
 * Returns move offset
 * @param move 
 * @param direction align offset according with direction
 * @returns 
 */
function getMoveOffset(move: Move, direction: Direction = 'forward'): Position {
  let directionCoefficient: number = direction === 'forward' ? 1 : -1;

  return {
    x: directionCoefficient * (move.end.x - move.start.x),
    y: directionCoefficient * (move.end.y - move.start.y),
  }
}

/**
   * Gets a position adding *pos* and *offset*
   * 
   * **Use *direction === 'forward'* if piece doesn't depend on direction!**
   * @param pos 
   * @param dir 
   * @param offset 
   * @returns 
   */
function getPositionRelativeTo(pos: Position, dir: Direction, offset: Position): Position | null {
  let resPosition: Position;
  if (dir === 'forward') {
    resPosition = {
      x: pos.x + offset.x,
      y: pos.y + offset.y,
    }
  } else {
    resPosition = {
      x: pos.x - offset.x,
      y: pos.y - offset.y,
    }
  }

  if (!inRange(resPosition.x, 0, 7) || !inRange(resPosition.y, 0, 7)) {
    return null;
  }
  return resPosition;
}

export { getMoveOffset, getPositionRelativeTo };