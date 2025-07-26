"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnightMoves = getKnightMoves;
const constants_1 = require("../../../constants");
const GameStateHelperFunctions_1 = require("../../../GameStateHelperFunctions");
const gameStateUtils_1 = require("../../../utils/gameStateUtils");
const historyUtils_1 = require("../../../utils/historyUtils");
const MoveUtils_1 = require("../../../utils/MoveUtils");
function getKnightMoves(gameState, pos, types) {
    const moves = [];
    const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, pos);
    if (!piece)
        return moves;
    const pseudoLegalKnightPositions = constants_1.KNIGHT_OFFSETS
        .map(a => { return { ...a }; })
        .filter(offset => {
        const end = (0, MoveUtils_1.getPositionRelativeTo)(pos, 'forward', offset);
        if (!end) {
            return false;
        }
        const move = (0, MoveUtils_1.getMove)(pos, end);
        const pieceOnSquare = (0, GameStateHelperFunctions_1.getFigure)(gameState, end);
        if (pieceOnSquare && (0, gameStateUtils_1.areAllies)(piece, pieceOnSquare)) {
            return false;
        }
        return true;
    })
        .map(offset => {
        return (0, MoveUtils_1.getPositionRelativeTo)(pos, 'forward', offset);
    });
    for (const endPos of pseudoLegalKnightPositions) {
        const destroyedPiece = (0, GameStateHelperFunctions_1.getFigure)(gameState, endPos);
        if (!destroyedPiece && (!types || types.includes('move'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), null, 'move', { isPromotion: false }));
        }
        if (destroyedPiece && (!types || types.includes('attackMove'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
        }
    }
    return moves;
}
//# sourceMappingURL=KnightMovesGenerator.js.map