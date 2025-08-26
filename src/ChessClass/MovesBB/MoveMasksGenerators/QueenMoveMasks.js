"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEEN_MOVE_MASKS = void 0;
exports.calculateQueenMoveMasks = calculateQueenMoveMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var MoveUtils_1 = require("../MoveUtils");
var QUEEN_MOVE_MASKS = [];
exports.QUEEN_MOVE_MASKS = QUEEN_MOVE_MASKS;
function calculateQueenMoveMasks() {
    for (var bit = 0; bit < 64; bit++) {
        var mask = ((0, MoveUtils_1.getFileBitboard)(bit) | (0, MoveUtils_1.getRankBitboard)(bit) | (0, MoveUtils_1.getDiagonalsFromBit)(bit)) & ~(0, bbUtils_1.getPosMask)(bit);
        QUEEN_MOVE_MASKS.push(mask);
    }
}
