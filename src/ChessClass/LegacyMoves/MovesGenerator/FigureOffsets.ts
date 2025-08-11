import { Position } from '../MoveTypes';


// Movement offsets
const KNIGHT_OFFSETS: Position[] = [
  { x: 1, y: 2 },
  { x: -1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: -2, y: 1 },
  { x: -2, y: -1 },
  { x: -1, y: -2 },
  { x: 1, y: -2 },
];
const ROOK_OFFSETS_NO_REPEAT: Position[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const ROOK_OFFSET_PATHS: Position[][] = ROOK_OFFSETS_NO_REPEAT
  .map(offsetUnit => {
    const offsets: Position[] = [];
    const iterOffset: Position = { ...offsetUnit };

    for (let i = 0; i < 7; i++) {
      offsets.push({ ...iterOffset });
      if (iterOffset.x !== 0) {
        iterOffset.x = +`${Math.sign(offsetUnit.x) === 1 ? '' : '-'}${Math.abs(iterOffset.x) + 1}`;
      } else {
        iterOffset.y = +`${Math.sign(offsetUnit.y) === 1 ? '' : '-'}${Math.abs(iterOffset.y) + 1}`;
      }
    }

    return offsets;
});

const BISHOP_OFFSETS_NO_REPEAT: Position[] = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];

const BISHOP_OFFSET_PATHS: Position[][] = BISHOP_OFFSETS_NO_REPEAT
  .map(offset => {
    const positions: Position[] = [];
    const iterOffset: Position = { ...offset };

    for (let i = 0; i < 7; i++) {
      positions.push({ ...iterOffset });
      iterOffset.x = iterOffset.x < 0 ? iterOffset.x - 1 : iterOffset.x + 1;
      iterOffset.y = iterOffset.y < 0 ? iterOffset.y - 1 : iterOffset.y + 1;
    }

    return positions;
  }
);


const QUEEN_OFFSET_PATHS: Position[][] = [
  ...ROOK_OFFSET_PATHS,
  ...BISHOP_OFFSET_PATHS
];

const KING_OFFSETS: Position[] = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 }
];

export { KING_OFFSETS, KNIGHT_OFFSETS, BISHOP_OFFSET_PATHS, ROOK_OFFSET_PATHS, QUEEN_OFFSET_PATHS };

