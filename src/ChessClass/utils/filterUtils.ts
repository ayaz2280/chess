import { Position } from "../Moves/MoveTypes";
import { HistoryEntry } from "../types/ChessTypes";
import { isSamePos } from "./MoveUtils";

function filterMovesLandingOn(entries: HistoryEntry[], squares: Position[]): HistoryEntry[] {
  return entries.filter(e => squares.find(s => isSamePos(e.move.end, s)));
}

export { filterMovesLandingOn };