"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOK_MOVE_MASKS = void 0;
exports.calculateRookMoveMasks = calculateRookMoveMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var MoveUtils_1 = require("../MoveUtils");
var ROOK_MOVE_MASKS = [];
exports.ROOK_MOVE_MASKS = ROOK_MOVE_MASKS;
function calculateRookMoveMasks() {
    for (var bit = 0; bit < 64; bit++) {
        var mask = ((0, MoveUtils_1.getFileBitboard)(bit) | (0, MoveUtils_1.getRankBitboard)(bit)) & ~(0, bbUtils_1.getPosMask)(bit);
        ROOK_MOVE_MASKS.push(mask);
    }
}
