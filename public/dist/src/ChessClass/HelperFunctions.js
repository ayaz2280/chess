"use strict";
/**
 * Checks if value is within given range, inclusively
 * @param value value to check
 * @param start start of the range
 * @param end end of the range
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveInGrid = moveInGrid;
exports.inRange = inRange;
exports.styled = styled;
exports.positionInGrid = positionInGrid;
exports.parseAlgNotation = parseAlgNotation;
exports.posToAlgNotation = posToAlgNotation;
exports.parseMove = parseMove;
exports.isSameHistoryEntry = isSameHistoryEntry;
exports.isSameMove = isSameMove;
exports.isSamePos = isSamePos;
exports.getUniqueArray = getUniqueArray;
exports.getPieceNumber = getPieceNumber;
exports.getSideToMoveNumber = getSideToMoveNumber;
exports.getCastlingRightsNumbers = getCastlingRightsNumbers;
exports.getFilesEnPassantNumbers = getFilesEnPassantNumbers;
const constants_1 = require("./constants");
function getPieceNumber(color, piece, pos) {
    if (!positionInGrid(pos))
        throw new Error(`Position ${pos} is not in grid dimensions`);
    const pieceType = constants_1.PIECE_TYPE[piece];
    const pieceColor = constants_1.PIECE_COLOR[color];
    const id = (pieceType * 2 * 64) + (pieceColor * 64) + 8 * pos.y + pos.x;
    return constants_1.PSEUDO_RANDOM_NUMBERS[id];
}
function getSideToMoveNumber() {
    return constants_1.PSEUDO_RANDOM_NUMBERS[768];
}
function getCastlingRightsNumbers() {
    return constants_1.PSEUDO_RANDOM_NUMBERS.slice(769, 773);
}
function getFilesEnPassantNumbers() {
    return constants_1.PSEUDO_RANDOM_NUMBERS.slice(773, 782);
}
function inRange(value, start, end) {
    if (start > end)
        return false;
    return value >= start && value <= end;
}
function positionInGrid(pos) {
    return inRange(pos.x, 0, 7) && inRange(pos.y, 0, 7);
}
function styled(s, styleCode) {
    return `\x1b[${styleCode}m${s}\x1b[0m`;
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
    if (!isDigit(notArr[1]))
        return false;
    const num = +notArr[1];
    if (letter < 'a' || letter > 'h' || num < 1 || num > 8) {
        return false;
    }
    return true;
}
function posToAlgNotation(pos) {
    if (!positionInGrid(pos))
        throw new Error(`Position '${pos}' is not in grid`);
    return `${String.fromCharCode(pos.x + 'a'.charCodeAt(0)).toLowerCase()}${pos.y + 1}`;
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
function moveInGrid(move) {
    return positionInGrid(move.start) && positionInGrid(move.end);
}
function isDigit(num) {
    return num >= '0' && num <= '9';
}
function isSameHistoryEntry(entry1, entry2) {
    let isSame = true;
    if (entry1.type !== entry2.type) {
        return false;
    }
    if (entry1.type === 'castling') {
        const [castlingEntry1, castlingEntry2] = [entry1, entry2];
        isSame = isSameMove(castlingEntry1.rookMove, castlingEntry2.rookMove) &&
            castlingEntry1.piece === castlingEntry2.piece;
    }
    return isSame && (entry1.player === entry2.player) &&
        (entry1.opponentKingChecked === entry2.opponentKingChecked) &&
        isSameMove(entry1.move, entry2.move) &&
        (entry1.destroyedPiece === entry2.destroyedPiece) &&
        (entry1.piece === entry2.piece);
}
function getUniqueArray(arr) {
    return [...new Set(arr)];
}
function isSameMove(move1, move2) {
    return isSamePos(move1.start, move2.start) && isSamePos(move1.end, move2.end);
}
function isSamePos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}
//# sourceMappingURL=HelperFunctions.js.map