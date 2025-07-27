"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToAlgNotation = moveToAlgNotation;
exports.posToAlgNotation = posToAlgNotation;
exports.parseAlgNotation = parseAlgNotation;
exports.parseMove = parseMove;
const Board_1 = require("../../Board/Board");
const utils_1 = require("../../utils/utils");
const boardUtils_1 = require("../../utils/boardUtils");
const boardUtils_2 = require("../../utils/boardUtils");
function moveToAlgNotation(HistoryEntry) {
    if (!(0, boardUtils_1.isMoveInGrid)(HistoryEntry.move)) {
        throw new Error(`Move's not in grid ${HistoryEntry.move}`);
    }
    return `${Board_1.Board.getPieceString(HistoryEntry.piece)} ${posToAlgNotation(HistoryEntry.move.start)}-${posToAlgNotation(HistoryEntry.move.end)}`;
}
function posToAlgNotation(pos) {
    if (!(0, boardUtils_2.positionInGrid)(pos))
        throw new Error(`Position '${pos}' is not in grid`);
    return `${String.fromCharCode(pos.x + 'a'.charCodeAt(0)).toLowerCase()}${pos.y + 1}`;
}
function parseAlgNotation(notationPos) {
    if (!isValidChessNotation(notationPos)) {
        throw new Error(`Invalid chess notation: ${notationPos}`);
    }
    const x = (notationPos.toLowerCase()).charCodeAt(0) - 'a'.charCodeAt(0);
    const y = +notationPos.charAt(1) - 1;
    return {
        x: x,
        y: y,
    };
}
function isValidChessNotation(notationPos) {
    if (notationPos.length !== 2) {
        return false;
    }
    const notArr = notationPos.split('');
    const letter = notArr[0].toLowerCase();
    if (!(0, utils_1.isDigit)(notArr[1]))
        return false;
    const num = +notArr[1];
    if (letter < 'a' || letter > 'h' || num < 1 || num > 8) {
        return false;
    }
    return true;
}
function parseMove(algNotationMove) {
    const algPositions = algNotationMove.matchAll(/[A-Ha-h]\d/gm).toArray();
    if (algPositions.length < 2)
        throw new Error(`Wrong move in algebraic notation: ${algNotationMove}`);
    const move = {
        start: parseAlgNotation(algPositions[0][0]),
        end: parseAlgNotation(algPositions[1][0]),
    };
    return move;
}
//# sourceMappingURL=AlgNotation.js.map