"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNIGHT_MOVE_MASKS = void 0;
exports.calculateKnightMoveMasks = calculateKnightMoveMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var BitboardConstants_1 = require("../../BoardBB/BitboardConstants");
var MoveConstants_1 = require("../MoveConstants");
var KNIGHT_MOVE_MASKS = [];
exports.KNIGHT_MOVE_MASKS = KNIGHT_MOVE_MASKS;
function calculateKnightMoveMasks() {
    var shifts = [6, 10, 15, 17, 6, 10, 15, 17];
    var masksOut = [
        ~(MoveConstants_1.FILES_BITBOARDS[0] | MoveConstants_1.FILES_BITBOARDS[1]),
        ~(MoveConstants_1.FILES_BITBOARDS[6] | MoveConstants_1.FILES_BITBOARDS[7]),
        ~MoveConstants_1.FILES_BITBOARDS[0],
        ~MoveConstants_1.FILES_BITBOARDS[7],
        ~(MoveConstants_1.FILES_BITBOARDS[6] | MoveConstants_1.FILES_BITBOARDS[7]),
        ~(MoveConstants_1.FILES_BITBOARDS[0] | MoveConstants_1.FILES_BITBOARDS[1]),
        ~MoveConstants_1.FILES_BITBOARDS[7],
        ~MoveConstants_1.FILES_BITBOARDS[0],
    ];
    for (var bit = 0; bit < 64; bit++) {
        var endMasks = BitboardConstants_1.emptyBitboard;
        for (var i = 0; i < 8; i++) {
            var endMask = (0, bbUtils_1.getPosMask)(bit) << BigInt(shifts[i % 4] * (i < 4 ? 1 : -1));
            endMask &= masksOut[i];
            endMask &= BitboardConstants_1.filledBitboard;
            endMasks |= endMask;
        }
        KNIGHT_MOVE_MASKS.push(endMasks);
    }
}
