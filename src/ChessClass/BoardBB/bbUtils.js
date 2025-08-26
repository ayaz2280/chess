"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaskFromPos = getMaskFromPos;
exports.getEnumPieceType = getEnumPieceType;
exports.getPosMask = getPosMask;
exports.getPosMaskShiftLeft = getPosMaskShiftLeft;
exports.getPosMaskShiftRight = getPosMaskShiftRight;
var utils_1 = require("../utils/utils");
var BitboardTypes_1 = require("./BitboardTypes");
function getMaskFromPos(pos) {
    return getPosMask(pos.y * 8 + pos.x);
}
function getPosMask(bit) {
    if (!(0, utils_1.inRange)(bit, 0, 63)) {
        throw new Error("Bit ".concat(bit, " is not in range from 0 to 63"));
    }
    return 1n << (8n * (BigInt(bit) / 8n) - BigInt(bit) % 8n + 7n);
}
function getPosMaskShiftLeft(bit, shift) {
    return getPosMask(bit) >> BigInt(shift);
}
function getPosMaskShiftRight(bit, shift) {
    return getPosMask(bit) << BigInt(shift);
}
function getEnumPieceType(piece) {
    var p = piece.toLowerCase();
    switch (p) {
        case 'p': return BitboardTypes_1.EnumPiece.Pawn;
        case 'q': return BitboardTypes_1.EnumPiece.Queen;
        case 'k': return BitboardTypes_1.EnumPiece.King;
        case 'b': return BitboardTypes_1.EnumPiece.Bishop;
        case 'n': return BitboardTypes_1.EnumPiece.Knight;
        case 'r': return BitboardTypes_1.EnumPiece.Rook;
        default: throw new Error("Couldn't parse a piece with name '".concat(piece, "'"));
    }
}
