"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKingChecked = isKingChecked;
exports.isKingAttackedAfterMove = isKingAttackedAfterMove;
const GameStateHelperFunctions_1 = require("../../GameStateHelperFunctions");
const gameStateUtils_1 = require("../../utils/gameStateUtils");
const historyUtils_1 = require("../../utils/historyUtils");
const MoveUtils_1 = require("../../utils/MoveUtils");
const SimulateMove_1 = require("../MoveSimulation/SimulateMove");
/**
 * Checks if *isKingAttacked* if *side* will not make any move
 */
function isKingChecked(gameState, side) {
    const turn = (0, gameStateUtils_1.nextSideToMove)(gameState);
    if (turn !== side) {
        throw new Error(`It's not ${side}'s turn to make a move!`);
    }
    const newGameState = (0, GameStateHelperFunctions_1.cloneGameState)(gameState);
    const kingPos = (0, GameStateHelperFunctions_1.findFigures)(newGameState, ['king'], side)[0];
    // placing a dummy entry
    newGameState.moveHistory.push((0, historyUtils_1.buildHistoryEntry)(newGameState, (0, MoveUtils_1.getMove)({ ...kingPos }, { ...kingPos }), null, 'move', { isPromotion: false }));
    return isKingAttacked(newGameState, side);
}
/*
  To check if the king of the given color is under attack, we need to check if a king's square is attacked.

  The king is considered under attack, if its square is immediately captured on the next opponent's move, and it's opponent's turn to make a move.
*/
function isKingAttacked(gameState, color) {
    const sideToMove = (0, gameStateUtils_1.nextSideToMove)(gameState);
    const opponentColor = color === 'white' ? 'black' : 'white';
    if (sideToMove !== opponentColor) {
        return false;
    }
    const figPositions = (0, GameStateHelperFunctions_1.findFigures)(gameState, ['king'], color);
    if (figPositions.length === 0) {
        return false;
    }
    const kingPos = figPositions[0];
    return (0, gameStateUtils_1.isSquareAttackedBy)(gameState, kingPos, opponentColor);
}
/**
 * Simulates a move and checks if king's checked after the move's made
 * @param gameState
 * @param color
 * @param move
 * @returns
 */
function isKingAttackedAfterMove(gameState, color, move) {
    const newGameState = (0, SimulateMove_1.simulateMove)(gameState, move);
    if (!newGameState) {
        throw new Error('Move`s not possible to simulate');
    }
    return isKingAttacked(newGameState, color);
}
//# sourceMappingURL=KingChecks.js.map