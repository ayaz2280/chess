"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveInGrid = exports.positionInGrid = exports.inRange = void 0;
exports.getMoveOffset = getMoveOffset;
exports.getPositionRelativeTo = getPositionRelativeTo;
exports.getMove = getMove;
exports.isSameHistoryEntry = isSameHistoryEntry;
exports.isSameMove = isSameMove;
exports.isSamePos = isSamePos;
const boardUtils_1 = require("./boardUtils");
Object.defineProperty(exports, "positionInGrid", { enumerable: true, get: function () { return boardUtils_1.positionInGrid; } });
Object.defineProperty(exports, "moveInGrid", { enumerable: true, get: function () { return boardUtils_1.isMoveInGrid; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "inRange", { enumerable: true, get: function () { return utils_1.inRange; } });
/**
 * Returns move offset
 * @param move
 * @param direction align offset according with direction
 * @returns
 */
function getMoveOffset(move, direction = 'forward') {
    let directionCoefficient = direction === 'forward' ? 1 : -1;
    return {
        x: directionCoefficient * (move.end.x - move.start.x),
        y: directionCoefficient * (move.end.y - move.start.y),
    };
}
/**
   * Gets a position adding *pos* and *offset*
   *
   * **Use *direction === 'forward'* if piece doesn't depend on direction!**
   * @param pos
   * @param dir
   * @param offset
   * @returns
   */
function getPositionRelativeTo(pos, dir, offset) {
    let resPosition;
    if (dir === 'forward') {
        resPosition = {
            x: pos.x + offset.x,
            y: pos.y + offset.y,
        };
    }
    else {
        resPosition = {
            x: pos.x - offset.x,
            y: pos.y - offset.y,
        };
    }
    if (!(0, utils_1.inRange)(resPosition.x, 0, 7) || !(0, utils_1.inRange)(resPosition.y, 0, 7)) {
        return null;
    }
    return resPosition;
}
function getMove(start, end) {
    if (!(0, boardUtils_1.positionInGrid)(start) || !(0, boardUtils_1.positionInGrid)(end))
        throw new Error(`Any of the position are out of grid: ${start}, ${end}`);
    return {
        start: start,
        end: end,
    };
}
function isSameMove(move1, move2) {
    return isSamePos(move1.start, move2.start) && isSamePos(move1.end, move2.end);
}
function isSamePos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
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
//# sourceMappingURL=MoveUtils.js.map