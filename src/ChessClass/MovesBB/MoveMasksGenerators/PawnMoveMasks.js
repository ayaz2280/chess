"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAWN_EN_PASSANT_FILE_MASKS = exports.PAWN_ATTACK_MASKS = exports.PAWN_PUSH_MASKS = void 0;
exports.calculatePawnAttackMasks = calculatePawnAttackMasks;
exports.calculatePawnPushMasks = calculatePawnPushMasks;
var bbUtils_1 = require("../../BoardBB/bbUtils");
var BitboardConstants_1 = require("../../BoardBB/BitboardConstants");
var MoveUtils_1 = require("../MoveUtils");
var MoveConstants_1 = require("../MoveConstants");
var PAWN_PUSH_MASKS = [];
exports.PAWN_PUSH_MASKS = PAWN_PUSH_MASKS;
var PAWN_ATTACK_MASKS = [];
exports.PAWN_ATTACK_MASKS = PAWN_ATTACK_MASKS;
var PAWN_EN_PASSANT_FILE_MASKS = __spreadArray([], MoveConstants_1.FILES_BITBOARDS, true);
exports.PAWN_EN_PASSANT_FILE_MASKS = PAWN_EN_PASSANT_FILE_MASKS;
function calculatePawnPushMasks() {
    for (var bit = 0; bit < 64; bit++) {
        var mask = void 0;
        if (bit >= 0 && bit <= 7 || bit >= 56 && bit <= 63) {
            mask = 0n; // No push possible on the first and last ranks
        }
        else {
            mask = (0, bbUtils_1.getPosMaskShiftRight)(bit, 8);
            if (bit >= 8 && bit <= 15) {
                mask |= (0, bbUtils_1.getPosMaskShiftRight)(bit, 16);
            }
        }
        mask &= BitboardConstants_1.filledBitboard;
        PAWN_PUSH_MASKS.push(mask);
    }
}
function calculatePawnAttackMasks() {
    for (var bit = 0; bit < 64; bit++) {
        var mask = 0n;
        //displayBitboard(mask);
        if (bit > 55) {
            PAWN_ATTACK_MASKS.push(mask);
            continue; // No attack possible on the first and last ranks
        }
        var fileNum = (0, MoveUtils_1.getFileNum)(bit);
        if (fileNum === 0) {
            mask |= (0, bbUtils_1.getPosMask)(bit) << 7n;
            //displayBitboard(mask);
        }
        if (fileNum === 7) {
            mask |= (0, bbUtils_1.getPosMask)(bit) << 9n;
            //displayBitboard(mask);
        }
        if (fileNum !== 0 && fileNum !== 7) {
            mask |= (0, bbUtils_1.getPosMask)(bit) << 7n;
            mask |= (0, bbUtils_1.getPosMask)(bit) << 9n;
        }
        mask &= BitboardConstants_1.filledBitboard;
        //displayBitboard(mask);
        PAWN_ATTACK_MASKS.push(mask);
    }
}
