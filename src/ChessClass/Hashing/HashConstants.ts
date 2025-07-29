import seedrandom, { PRNG } from 'seedrandom';
import { range } from '../utils/utils';
import { FigureType } from '../Figure/FigureTypes';
import { Position } from '../Moves/MoveTypes';
import { ColorType } from '../Player/PlayerTypes';
import { positionInGrid } from "../utils/boardUtils";

export const ZOBRIST_SEED = "8(800)-555-35-35_Better_call_HERE";

const rng: PRNG = seedrandom(ZOBRIST_SEED);

function generate64BitRandomNumber(): bigint {
  const high: number = Math.floor(rng() * 0x100000000);
  const low: number = Math.floor(rng() * 0x100000000);

  return (BigInt(high) << 32n) | BigInt(low);
}

const PSEUDO_RANDOM_NUMBERS: bigint[] = [];
const FIGURE_NUMBERS: bigint[][] = [];

for (let i = 0; i < 12; i++) {
  FIGURE_NUMBERS[i] = [];
  for (let j = 0; j < 64; j++) {
    FIGURE_NUMBERS[i].push(generate64BitRandomNumber());
  }
}

PSEUDO_RANDOM_NUMBERS.push(...FIGURE_NUMBERS.flat());

for (let i = 0; i < 13; i++) {
  PSEUDO_RANDOM_NUMBERS.push(generate64BitRandomNumber());
}

const HASH_SIDE_TO_MOVE_INDEX: number = 768;
const HASH_CASTLING_RIGHTS_INDICES: number[] = [769, 770, 771, 772];
const HASH_EN_PASSANT_FILE_INDICES: number[] = range(773, 781);

const HASH_SIDE_TO_MOVE_NUMBER: bigint = PSEUDO_RANDOM_NUMBERS[HASH_SIDE_TO_MOVE_INDEX];
const HASH_CASTLING_RIGHTS_NUMBERS: bigint[] = PSEUDO_RANDOM_NUMBERS.slice(769,773);
const HASH_EN_PASSANT_FILES_NUMBERS: bigint[] = PSEUDO_RANDOM_NUMBERS.slice(773,782);


enum PIECE_TYPE {
  'pawn',
  'knight',
  'bishop',
  'rook',
  'queen',
  'king',
}

enum PIECE_COLOR {
  'white',
  'black'
}

function getPieceNumber(color: ColorType, piece: FigureType, pos: Position): bigint {
  if (!positionInGrid(pos)) throw new Error(`Position ${pos} is not in grid dimensions`);

  const pieceType: number = PIECE_TYPE[piece];
  const pieceColor: number = PIECE_COLOR[color];

  const id: number = (pieceType * 2 * 64) + (pieceColor * 64) + 8 * pos.y + pos.x;

  return PSEUDO_RANDOM_NUMBERS[id];
}

export { PSEUDO_RANDOM_NUMBERS, HASH_SIDE_TO_MOVE_NUMBER, HASH_CASTLING_RIGHTS_NUMBERS, HASH_EN_PASSANT_FILES_NUMBERS, getPieceNumber };

