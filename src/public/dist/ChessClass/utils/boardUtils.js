"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionInGrid = positionInGrid;
exports.isMoveInGrid = isMoveInGrid;
const utils_1 = require("./utils");
function positionInGrid(pos) {
    return (0, utils_1.inRange)(pos.x, 0, 7) && (0, utils_1.inRange)(pos.y, 0, 7);
}
function isMoveInGrid(move) {
    return positionInGrid(move.start) && positionInGrid(move.end);
}
//# sourceMappingURL=boardUtils.js.map