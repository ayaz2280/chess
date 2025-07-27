"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBishopMoves = getBishopMoves;
const FigureOffsets_1 = require("../FigureOffsets");
const gameStateUtils_1 = require("../../../utils/gameStateUtils");
const historyUtils_1 = require("../../../utils/historyUtils");
const MoveUtils_1 = require("../../../utils/MoveUtils");
function getBishopMoves(gameState, pos, types) {
    const moves = [];
    const board = gameState.board;
    const piece = board.getPiece(pos);
    if (!piece)
        return moves;
    const pseudoLegalBishopPositions = FigureOffsets_1.BISHOP_OFFSET_PATHS
        .flatMap(offsetPath => {
        const legitPositions = [];
        for (const offset of offsetPath) {
            const resPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, 'forward', offset);
            if (!resPos)
                break;
            const pieceOnSquare = board.getPiece(resPos);
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
    for (const endPos of pseudoLegalBishopPositions) {
        const destroyedPiece = board.getPiece(endPos);
        if (!destroyedPiece && (!types || types.includes('move'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), null, 'move', { isPromotion: false }));
        }
        if (destroyedPiece && (!types || types.includes('attackMove'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
        }
    }
    return moves;
}
//# sourceMappingURL=BishopMovesGenerator.js.map