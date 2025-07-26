"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoveOffset = getMoveOffset;
exports.getPositionRelativeTo = getPositionRelativeTo;
exports.getMove = getMove;
const HelperFunctions_1 = require("../HelperFunctions");
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
    if (!(0, HelperFunctions_1.inRange)(resPosition.x, 0, 7) || !(0, HelperFunctions_1.inRange)(resPosition.y, 0, 7)) {
        return null;
    }
    return resPosition;
}
function getMove(start, end) {
    if (!(0, HelperFunctions_1.positionInGrid)(start) || !(0, HelperFunctions_1.positionInGrid)(end))
        throw new Error(`Any of the position are out of grid: ${start}, ${end}`);
    return {
        start: start,
        end: end,
    };
}
//# sourceMappingURL=MoveUtils.js.map