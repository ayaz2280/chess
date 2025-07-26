"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRookMoves = getRookMoves;
const constants_1 = require("../../../constants");
const GameStateHelperFunctions_1 = require("../../../GameStateHelperFunctions");
const gameStateUtils_1 = require("../../../utils/gameStateUtils");
const historyUtils_1 = require("../../../utils/historyUtils");
const MoveUtils_1 = require("../../../utils/MoveUtils");
function getRookMoves(gameState, pos, types) {
    const moves = [];
    const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, pos);
    if (!piece)
        return moves;
    const pseudoLegalRookPositions = constants_1.ROOK_OFFSET_PATHS
        .flatMap(offsetPath => {
        const legitPositions = [];
        for (const offset of offsetPath) {
            const resPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, 'forward', offset);
            if (!resPos)
                break;
            const pieceOnSquare = (0, GameStateHelperFunctions_1.getFigure)(gameState, resPos);
            if (pieceOnSquare && (0, gameStateUtils_1.areAllies)(piece, pieceOnSquare)) {
                break;
            }
            legitPositions.push(resPos);
            if (pieceOnSquare) {
                break;
            }
        }
        return legitPositions;
    });
    for (const endPos of pseudoLegalRookPositions) {
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
//# sourceMappingURL=RookMovesGenerator.js.map