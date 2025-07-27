"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSquareAttackedBy = isSquareAttackedBy;
exports.isFirstMove = isFirstMove;
exports.onInitPosition = onInitPosition;
const Board_1 = require("../Board/Board");
const MovesGenerator_1 = require("../Moves/MovesGenerator/MovesGenerator");
const MoveUtils_1 = require("./MoveUtils");
function isSquareAttackedBy(gameState, square, attackerSide) {
    const board = gameState.board;
    const attackerFigurePositions = board.findFigures('all', attackerSide);
    for (const enemyPos of attackerFigurePositions) {
        const piece = board.getPiece(enemyPos);
        const endPositions = (0, MovesGenerator_1.getMoves)(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);
        if (endPositions.find(endP => (0, MoveUtils_1.isSamePos)(endP, square)))
            return true;
    }
    return false;
}
function isFirstMove(gameState, pos) {
    const piece = gameState.board.getPiece(pos);
    if (!piece)
        return false;
    const moveHistory = gameState.moveHistory;
    for (let entry of moveHistory) {
        if (piece === entry.piece) {
            return false;
        }
    }
    return true && onInitPosition(gameState, pos);
}
function onInitPosition(gameState, pos) {
    if (!(0, MoveUtils_1.positionInGrid)(pos))
        return false;
    const piece = gameState.board.getPiece(pos);
    const pieceOnSetupBoard = Board_1.INIT_SETUP_BOARD.grid[pos.y][pos.x];
    if (!piece || !pieceOnSetupBoard)
        return false;
    return piece.getPiece() === pieceOnSetupBoard.getPiece() && piece.getColor() === pieceOnSetupBoard.getColor();
}
//# sourceMappingURL=MoveCheckUtils.js.map