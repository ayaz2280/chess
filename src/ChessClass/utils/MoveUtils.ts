import { Direction, Move, Position } from "../Moves/MoveTypes";
import { CastlingMoveInfo, HistoryEntry } from "../types/ChessTypes";
import { positionInGrid, isMoveInGrid } from "./boardUtils";
import { inRange } from "./utils";

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

function getMove(start: Position, end: Position): Move {
  if (!positionInGrid(start) || !positionInGrid(end)) throw new Error(`Any of the position are out of grid: ${start}, ${end}`);

  return {
    start: start,
    end: end,
  };
}

function isSameMove(move1: Move, move2: Move): boolean {
  return isSamePos(move1.start, move2.start) && isSamePos(move1.end, move2.end);
}

function isSamePos(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function isSameHistoryEntry(entry1: HistoryEntry, entry2: HistoryEntry): boolean {
  let isSame: boolean = true;
  
  if (entry1.type !== entry2.type) {
    return false;
  }

  if (entry1.type === 'castling') {
    const [castlingEntry1, castlingEntry2] = [entry1 as CastlingMoveInfo, entry2 as CastlingMoveInfo];

    isSame = isSameMove(castlingEntry1.rookMove, castlingEntry2.rookMove) && 
    castlingEntry1.piece === castlingEntry2.piece;
  }

  return isSame && (entry1.player === entry2.player) && 
  (entry1.opponentKingChecked === entry2.opponentKingChecked) && 
  isSameMove(entry1.move, entry2.move) &&
  (entry1.destroyedPiece === entry2.destroyedPiece) &&
  (entry1.piece === entry2.piece);
}

export { getMoveOffset, getPositionRelativeTo, getMove, inRange, positionInGrid, isMoveInGrid as moveInGrid, isSameHistoryEntry, isSameMove, isSamePos };



