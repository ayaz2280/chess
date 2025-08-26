"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KING_MOVE_MASKS = void 0;
exports.calculateKingMoveMasks = calculateKingMoveMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var BitboardConstants_1 = require("../../BoardBB/BitboardConstants");
var MoveConstants_1 = require("../MoveConstants");
var MoveUtils_1 = require("../MoveUtils");
var KING_MOVE_MASKS = [];
exports.KING_MOVE_MASKS = KING_MOVE_MASKS;
var shifts = [1, 7, 8, 9];
function calculateKingMoveMasks() {
    var _loop_1 = function (bit) {
        var file = (0, MoveUtils_1.getFileNum)(bit);
        var mask = 0n;
        var posMask = (0, bbUtils_1.getPosMask)(bit);
        shifts.forEach(function (sh) {
            mask |= posMask << BigInt(sh);
            mask |= posMask >> BigInt(sh);
        });
        if (file === 0) {
            mask &= MoveConstants_1.FILES_BITBOARDS[0] | MoveConstants_1.FILES_BITBOARDS[1];
        }
        if (file === 7) {
            mask &= MoveConstants_1.FILES_BITBOARDS[6] | MoveConstants_1.FILES_BITBOARDS[7];
        }
        mask &= BitboardConstants_1.filledBitboard;
        KING_MOVE_MASKS.push(mask);
    };
    for (var bit = 0; bit < 64; bit++) {
        _loop_1(bit);
    }
}
