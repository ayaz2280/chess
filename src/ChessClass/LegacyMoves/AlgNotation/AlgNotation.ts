import { Board } from "../../Board/Board";
import { isDigit } from "../../utils/utils";
import { isMoveInGrid } from "../../utils/boardUtils";
import { positionInGrid } from "../../utils/boardUtils";
import { HistoryEntry, Move, Position } from "../../types/ChessTypes";

function moveToAlgNotation(HistoryEntry: HistoryEntry): string {
  if (!isMoveInGrid(HistoryEntry.move)) {
    throw new Error(`Move's not in grid ${HistoryEntry.move}`);
  }
  return `${Board.getPieceString(HistoryEntry.piece)} ${posToAlgNotation(HistoryEntry.move.start)}-${posToAlgNotation(HistoryEntry.move.end)}`;
}

function posToAlgNotation(pos: Position): string {
  if (!positionInGrid(pos))
    throw new Error(`Position '${pos}' is not in grid`);
  return `${String.fromCharCode(pos.x + 'a'.charCodeAt(0)).toLowerCase()}${pos.y + 1}`;
}

function parseAlgNotation(notationPos: string): Position {
  if (!isValidChessNotation(notationPos)) {
    throw new Error(`Invalid chess notation: ${notationPos}`);
  }

  const x: number = (notationPos.toLowerCase()).charCodeAt(0) - 'a'.charCodeAt(0);
  const y: number = +notationPos.charAt(1) - 1;

  return {
    x: x,
    y: y,
  };
}
function isValidChessNotation(notationPos: string): boolean {
  if (notationPos.length !== 2) {
    return false;
  }

  const notArr: string[] = notationPos.split('');

  const letter: string = notArr[0].toLowerCase();

  if (!isDigit(notArr[1])) return false;

  const num: number = +notArr[1];

  if (letter < 'a' || letter > 'h' || num < 1 || num > 8) {
    return false;
  }

  return true;
}
function parseMove(algNotationMove: string): Move {
  const algPositions: RegExpExecArray[] = algNotationMove.matchAll(/[A-Ha-h]\d/gm).toArray();

  if (algPositions.length < 2) throw new Error(`Wrong move in algebraic notation: ${algNotationMove}`);

  const move: Move = {
    start: parseAlgNotation(algPositions[0][0]),
    end: parseAlgNotation(algPositions[1][0]),
  };

  return move;
}

export { moveToAlgNotation, posToAlgNotation, parseAlgNotation, parseMove };
