"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayBitboard = displayBitboard;
function displayBitboard(bitboard) {
    var segments = bitboard.toString(2).padStart(64, '0').match(/.{1,8}/g) || [];
    var resString = '';
    segments.forEach(function (segment, index) {
        resString += segment.split('').join(' ') + '\n';
    });
    console.log(resString);
}
