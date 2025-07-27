"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HASH_EN_PASSANT_FILES_NUMBERS = exports.HASH_CASTLING_RIGHTS_NUMBERS = exports.HASH_SIDE_TO_MOVE_NUMBER = exports.PSEUDO_RANDOM_NUMBERS = exports.ZOBRIST_SEED = void 0;
exports.getPieceNumber = getPieceNumber;
const seedrandom_1 = __importDefault(require("seedrandom"));
const utils_1 = require("../utils/utils");
const boardUtils_1 = require("../utils/boardUtils");
exports.ZOBRIST_SEED = "8(800)-555-35-35_Better_call_HERE";
const rng = (0, seedrandom_1.default)(exports.ZOBRIST_SEED);
function generate64BitRandomNumber() {
    const high = Math.floor(rng() * 0x100000000);
    const low = Math.floor(rng() * 0x100000000);
    return (BigInt(high) << 32n) | BigInt(low);
}
const PSEUDO_RANDOM_NUMBERS = [];
exports.PSEUDO_RANDOM_NUMBERS = PSEUDO_RANDOM_NUMBERS;
const FIGURE_NUMBERS = [];
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
const HASH_SIDE_TO_MOVE_INDEX = 768;
const HASH_CASTLING_RIGHTS_INDICES = [769, 770, 771, 772];
const HASH_EN_PASSANT_FILE_INDICES = (0, utils_1.range)(773, 781);
const HASH_SIDE_TO_MOVE_NUMBER = PSEUDO_RANDOM_NUMBERS[HASH_SIDE_TO_MOVE_INDEX];
exports.HASH_SIDE_TO_MOVE_NUMBER = HASH_SIDE_TO_MOVE_NUMBER;
const HASH_CASTLING_RIGHTS_NUMBERS = PSEUDO_RANDOM_NUMBERS.slice(769, 773);
exports.HASH_CASTLING_RIGHTS_NUMBERS = HASH_CASTLING_RIGHTS_NUMBERS;
const HASH_EN_PASSANT_FILES_NUMBERS = PSEUDO_RANDOM_NUMBERS.slice(773, 782);
exports.HASH_EN_PASSANT_FILES_NUMBERS = HASH_EN_PASSANT_FILES_NUMBERS;
var PIECE_TYPE;
(function (PIECE_TYPE) {
    PIECE_TYPE[PIECE_TYPE["pawn"] = 0] = "pawn";
    PIECE_TYPE[PIECE_TYPE["knight"] = 1] = "knight";
    PIECE_TYPE[PIECE_TYPE["bishop"] = 2] = "bishop";
    PIECE_TYPE[PIECE_TYPE["rook"] = 3] = "rook";
    PIECE_TYPE[PIECE_TYPE["queen"] = 4] = "queen";
    PIECE_TYPE[PIECE_TYPE["king"] = 5] = "king";
})(PIECE_TYPE || (PIECE_TYPE = {}));
var PIECE_COLOR;
(function (PIECE_COLOR) {
    PIECE_COLOR[PIECE_COLOR["white"] = 0] = "white";
    PIECE_COLOR[PIECE_COLOR["black"] = 1] = "black";
})(PIECE_COLOR || (PIECE_COLOR = {}));
function getPieceNumber(color, piece, pos) {
    if (!(0, boardUtils_1.positionInGrid)(pos))
        throw new Error(`Position ${pos} is not in grid dimensions`);
    const pieceType = PIECE_TYPE[piece];
    const pieceColor = PIECE_COLOR[color];
    const id = (pieceType * 2 * 64) + (pieceColor * 64) + 8 * pos.y + pos.x;
    return PSEUDO_RANDOM_NUMBERS[id];
}
//# sourceMappingURL=HashConstants.js.map