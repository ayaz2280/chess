/**
 * Checks if value is within given range, inclusively
 * @param value value to check
 * @param start start of the range
 * @param end end of the range
 */


import { PIECE_COLOR, PIECE_TYPE, PSEUDO_RANDOM_NUMBERS } from "./constants";
import { FigureType } from "./Figure/FigureTypes";
import { Move, Position } from "./Moves/MoveTypes";
import { ColorType } from "./Player/PlayerTypes";


function getPieceNumber(color: ColorType, piece: FigureType, pos: Position): bigint {
  if (!positionInGrid(pos)) throw new Error(`Position ${pos} is not in grid dimensions`);

  const pieceType: number = PIECE_TYPE[piece];
  const pieceColor: number = PIECE_COLOR[color];

  const id: number = (pieceType * 2 * 64) + (pieceColor * 64) + 8 * pos.y + pos.x;

  return PSEUDO_RANDOM_NUMBERS[id];
}

function getSideToMoveNumber(): bigint {
  return PSEUDO_RANDOM_NUMBERS[768];
}

function getCastlingRightsNumbers(): bigint[] {
  return PSEUDO_RANDOM_NUMBERS.slice(769, 773);
}

function getFilesEnPassantNumbers(): bigint[] {
  return PSEUDO_RANDOM_NUMBERS.slice(773, 782);
}

function inRange(value: number, start: number, end: number): boolean {
  if (start > end) return false;
  return value >= start && value <= end;
}

function positionInGrid(pos: Position) {
  return inRange(pos.x, 0, 7) && inRange(pos.y, 0, 7);
}

function styled(s: string, styleCode: number): string {
  return `\x1b[${styleCode}m${s}\x1b[0m`;
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

function posToAlgNotation(pos: Position): string {
  if (!positionInGrid(pos))
    throw new Error(`Position '${pos}' is not in grid`);
  return `${String.fromCharCode(pos.x + 'a'.charCodeAt(0)).toLowerCase()}${pos.y+1}`;
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

export function moveInGrid(move: Move): boolean {
  return positionInGrid(move.start) && positionInGrid(move.end);
}

function isDigit(num: string): boolean {
  return num >= '0' && num <= '9';
}

function getUniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export { inRange, styled, positionInGrid, parseAlgNotation, posToAlgNotation, parseMove, getUniqueArray, getPieceNumber, getSideToMoveNumber, getCastlingRightsNumbers, getFilesEnPassantNumbers, isDigit };
