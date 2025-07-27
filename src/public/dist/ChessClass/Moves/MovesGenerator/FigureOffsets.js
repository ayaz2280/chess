"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEEN_OFFSET_PATHS = exports.ROOK_OFFSET_PATHS = exports.BISHOP_OFFSET_PATHS = exports.KNIGHT_OFFSETS = exports.KING_OFFSETS = void 0;
// Movement offsets
const KNIGHT_OFFSETS = [
    { x: 1, y: 2 },
    { x: -1, y: 2 },
    { x: 2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: 1 },
    { x: -2, y: -1 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
];
exports.KNIGHT_OFFSETS = KNIGHT_OFFSETS;
const ROOK_OFFSETS_NO_REPEAT = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
];
const ROOK_OFFSET_PATHS = ROOK_OFFSETS_NO_REPEAT
    .map(offsetUnit => {
    const offsets = [];
    const iterOffset = { ...offsetUnit };
    for (let i = 0; i < 7; i++) {
        offsets.push({ ...iterOffset });
        if (iterOffset.x !== 0) {
            iterOffset.x = +`${Math.sign(offsetUnit.x) === 1 ? '' : '-'}${Math.abs(iterOffset.x) + 1}`;
        }
        else {
            iterOffset.y = +`${Math.sign(offsetUnit.y) === 1 ? '' : '-'}${Math.abs(iterOffset.y) + 1}`;
        }
    }
    return offsets;
});
exports.ROOK_OFFSET_PATHS = ROOK_OFFSET_PATHS;
const BISHOP_OFFSETS_NO_REPEAT = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
];
const BISHOP_OFFSET_PATHS = BISHOP_OFFSETS_NO_REPEAT
    .map(offset => {
    const positions = [];
    const iterOffset = { ...offset };
    for (let i = 0; i < 7; i++) {
        positions.push({ ...iterOffset });
        iterOffset.x = iterOffset.x < 0 ? iterOffset.x - 1 : iterOffset.x + 1;
        iterOffset.y = iterOffset.y < 0 ? iterOffset.y - 1 : iterOffset.y + 1;
    }
    return positions;
});
exports.BISHOP_OFFSET_PATHS = BISHOP_OFFSET_PATHS;
const QUEEN_OFFSET_PATHS = [
    ...ROOK_OFFSET_PATHS,
    ...BISHOP_OFFSET_PATHS
];
exports.QUEEN_OFFSET_PATHS = QUEEN_OFFSET_PATHS;
const KING_OFFSETS = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
];
exports.KING_OFFSETS = KING_OFFSETS;
//# sourceMappingURL=FigureOffsets.js.map