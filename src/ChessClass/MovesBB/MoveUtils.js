"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileBitboard = getFileBitboard;
exports.getRankBitboard = getRankBitboard;
exports.getRankBitboardWithOffset = getRankBitboardWithOffset;
exports.getFileBitboardWithOffset = getFileBitboardWithOffset;
exports.getRightDiagonalFromBit = getRightDiagonalFromBit;
exports.getLeftDiagonalFromBit = getLeftDiagonalFromBit;
exports.getDiagonalsFromBit = getDiagonalsFromBit;
exports.getFileNum = getFileNum;
var BitboardConstants_1 = require("../BoardBB/BitboardConstants");
var MoveConstants_1 = require("./MoveConstants");
function getFileBitboard(bit) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    return 0x8080808080808080n >> BigInt(bit % 8);
}
function getFileBitboardWithOffset(bit, offset, direction) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    if (offset < 0 || offset > 7) {
        throw new Error("Offset ".concat(offset, " is out of range (0 to 7)"));
    }
    var fileNum = bit % 8;
    var fileNumWithOffset = direction === 'LEFT' ? fileNum - offset : fileNum + offset;
    if (fileNumWithOffset < 0) {
        return MoveConstants_1.LEFTMOST_FILE;
    }
    if (fileNumWithOffset > 7) {
        return MoveConstants_1.RIGHTMOST_FILE;
    }
    var fileBB = getFileBitboard(bit);
    var fileBbOffset = (direction === 'LEFT'
        ? fileBB << BigInt(offset)
        : fileBB >> BigInt(offset));
    return fileBbOffset;
}
function getRankBitboard(bit) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    return 0x00000000000000ffn << (8n * (BigInt(bit) / 8n));
}
function getRankBitboardWithOffset(bit, offset, direction) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    if (offset < 0 || offset > 7) {
        throw new Error("Offset ".concat(offset, " is out of range (0 to 7)"));
    }
    var rankBB = getRankBitboard(bit);
    var rankBbOffset = (direction === 'UP'
        ? rankBB << (8n * BigInt(offset))
        : rankBB >> (8n * BigInt(offset)));
    var rankBbOffsetMasked = rankBbOffset & BitboardConstants_1.filledBitboard;
    if (rankBbOffsetMasked === 0n) {
        return direction === 'UP' ? MoveConstants_1.MAXIMAL_RANK : MoveConstants_1.MINIMAL_RANK;
    }
    return rankBbOffset;
}
function getRightDiagonalFromBit(bit) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    return MoveConstants_1.RIGHT_DIAGONAL_BIT_MAP[bit];
}
function getLeftDiagonalFromBit(bit) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    return MoveConstants_1.LEFT_DIAGONAL_BIT_MAP[bit];
}
function getDiagonalsFromBit(bit) {
    if (bit < 0 || bit > 63) {
        throw new Error("Bit ".concat(bit, " is out of range (0-63)"));
    }
    return MoveConstants_1.LEFT_DIAGONAL_BIT_MAP[bit] | MoveConstants_1.RIGHT_DIAGONAL_BIT_MAP[bit];
}
function getFileNum(bit) {
    return bit % 8;
}
