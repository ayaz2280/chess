"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirection = getDirection;
exports.getPlayer = getPlayer;
exports.isRankEndOfBoard = isRankEndOfBoard;
exports.canAttackSquare = canAttackSquare;
exports.areAllies = areAllies;
exports.containsInitialFigure = containsInitialFigure;
exports.nextSideToMove = nextSideToMove;
exports.isPieceOnEndOfBoard = isPieceOnEndOfBoard;
exports.isSquareAttackedBy = isSquareAttackedBy;
exports.getPiecePosition = getPiecePosition;
exports.flipSideToMove = flipSideToMove;
exports.getDestroyedPiece = getDestroyedPiece;
const GameStateHelperFunctions_1 = require("../GameStateHelperFunctions");
const MoveUtils_1 = require("./MoveUtils");
const MovesGenerator_1 = require("../Moves/MovesGenerator/MovesGenerator");
const HelperFunctions_1 = require("../HelperFunctions");
function getDirection(gameState, piece) {
    return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
}
function getPlayer(gameState, color) {
    return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
}
function isRankEndOfBoard(gameState, rank, side) {
    return gameState.player.getColor() === side ? rank === 7 : rank === 0;
}
function canAttackSquare(gameState, attackerPos, squareToAttack, attackingOffset) {
    const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, attackerPos);
    if (!piece)
        return false;
    const piece2 = (0, GameStateHelperFunctions_1.getFigure)(gameState, squareToAttack);
    if (!piece2)
        return false;
    if (areAllies(piece, piece2))
        return false;
    const calculatedSquare = (0, MoveUtils_1.getPositionRelativeTo)(attackerPos, getDirection(gameState, piece), attackingOffset);
    if (!calculatedSquare || !(0, GameStateHelperFunctions_1.isSamePos)(calculatedSquare, squareToAttack))
        return false;
    return true;
}
function areAllies(p1, p2) {
    return p1.getColor() === p2.getColor();
}
/**
 * Checks if piece from *initPos* has ever moved from the start of the game.
 * @param gameState
 * @param initPos
 */
function containsInitialFigure(gameState, initPos) {
    if (gameState.moveHistory.length === 0) {
        return (0, GameStateHelperFunctions_1.getFigure)(gameState, initPos) ? true : false;
    }
    if (gameState.moveHistory[0].board.getPiece(initPos) === gameState.board.getPiece(initPos))
        return true;
    return false;
}
function nextSideToMove(gameState) {
    const moveHistory = gameState.moveHistory;
    if (moveHistory.length === 0) {
        return 'white';
    }
    const lastEntry = moveHistory[moveHistory.length - 1];
    return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
}
function isPieceOnEndOfBoard(gameState, pos) {
    const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, pos);
    if (!piece) {
        return false;
    }
    const dir = getDirection(gameState, piece);
    return (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, { x: 0, y: 1 }) ? false : true;
}
function isSquareAttackedBy(gameState, square, attackerSide) {
    const attackerFigurePositions = (0, GameStateHelperFunctions_1.findFigures)(gameState, 'all', attackerSide);
    for (const enemyPos of attackerFigurePositions) {
        const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, enemyPos);
        const endPositions = (0, MovesGenerator_1.getMoves)(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);
        if (endPositions.find(endP => (0, GameStateHelperFunctions_1.isSamePos)(endP, square)))
            return true;
    }
    return false;
}
function getPiecePosition(gameState, piece) {
    for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
            if (piece === gameState.board.grid[y][x]) {
                return { x: x, y: y };
            }
        }
    }
    return null;
}
function flipSideToMove(gameState) {
    gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
    gameState.hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
}
function getDestroyedPiece(gameState, attackerPiece, move) {
    if (!attackerPiece)
        return null;
    const player = getPlayer(gameState, attackerPiece.getColor());
    const pieceToBeDestroyed = (0, GameStateHelperFunctions_1.getFigure)(gameState, move.end);
    if (!pieceToBeDestroyed)
        return null;
    if (areAllies(attackerPiece, pieceToBeDestroyed))
        return null;
    return pieceToBeDestroyed;
}
//# sourceMappingURL=gameStateUtils.js.map