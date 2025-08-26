"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BISHOP_MOVE_MASKS = void 0;
exports.calculateBishopMoveMasks = calculateBishopMoveMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var MoveUtils_1 = require("../MoveUtils");
var BISHOP_MOVE_MASKS = [];
exports.BISHOP_MOVE_MASKS = BISHOP_MOVE_MASKS;
function calculateBishopMoveMasks() {
    for (var bit = 0; bit < 64; bit++) {
        var mask = (0, MoveUtils_1.getDiagonalsFromBit)(bit) & ~(0, bbUtils_1.getPosMask)(bit);
        BISHOP_MOVE_MASKS.push(mask);
    }
}
