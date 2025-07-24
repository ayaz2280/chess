"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIECE_TYPE = exports.PIECE_COLOR = exports.PSEUDO_RANDOM_NUMBERS = exports.KING_OFFSETS = exports.QUEEN_OFFSET_PATHS = exports.BISHOP_OFFSET_PATHS = exports.ROOK_OFFSET_PATHS = exports.KNIGHT_OFFSETS = void 0;
exports.getPieceColorIndex = getPieceColorIndex;
const Random_1 = require("./Random");
var PIECE_TYPE;
(function (PIECE_TYPE) {
    PIECE_TYPE[PIECE_TYPE["pawn"] = 0] = "pawn";
    PIECE_TYPE[PIECE_TYPE["knight"] = 1] = "knight";
    PIECE_TYPE[PIECE_TYPE["bishop"] = 2] = "bishop";
    PIECE_TYPE[PIECE_TYPE["rook"] = 3] = "rook";
    PIECE_TYPE[PIECE_TYPE["queen"] = 4] = "queen";
    PIECE_TYPE[PIECE_TYPE["king"] = 5] = "king";
})(PIECE_TYPE || (exports.PIECE_TYPE = PIECE_TYPE = {}));
var PIECE_COLOR;
(function (PIECE_COLOR) {
    PIECE_COLOR[PIECE_COLOR["white"] = 0] = "white";
    PIECE_COLOR[PIECE_COLOR["black"] = 1] = "black";
})(PIECE_COLOR || (exports.PIECE_COLOR = PIECE_COLOR = {}));
function getPieceColorIndex(type, color) {
    if (color === 'white') {
        return PIECE_TYPE[type];
    }
    else {
        return PIECE_TYPE[type] + 6;
    }
}
const PSEUDO_RANDOM_NUMBERS = [];
exports.PSEUDO_RANDOM_NUMBERS = PSEUDO_RANDOM_NUMBERS;
const FIGURE_NUMBERS = [];
for (let i = 0; i < 12; i++) {
    FIGURE_NUMBERS[i] = [];
    for (let j = 0; j < 64; j++) {
        FIGURE_NUMBERS[i].push((0, Random_1.generate64BitRandomNumber)());
    }
}
PSEUDO_RANDOM_NUMBERS.push(...FIGURE_NUMBERS.flat());
for (let i = 0; i < 13; i++) {
    PSEUDO_RANDOM_NUMBERS.push((0, Random_1.generate64BitRandomNumber)());
}
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
//# sourceMappingURL=constants.js.map