import { Position, Move } from "../Moves/MoveTypes";
import { inRange } from "./utils";


export function positionInGrid(pos: Position) {
  return inRange(pos.x, 0, 7) && inRange(pos.y, 0, 7);
}
export function isMoveInGrid(move: Move): boolean {
  return positionInGrid(move.start) && positionInGrid(move.end);
}
