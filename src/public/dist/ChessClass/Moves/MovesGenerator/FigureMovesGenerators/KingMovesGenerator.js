"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKingMoves = getKingMoves;
const FigureOffsets_1 = require("../FigureOffsets");
const gameStateUtils_1 = require("../../../utils/gameStateUtils");
const LegalityCheckUtils_1 = require("../../../utils/LegalityCheckUtils");
const historyUtils_1 = require("../../../utils/historyUtils");
const MoveUtils_1 = require("../../../utils/MoveUtils");
const KingChecks_1 = require("../../LegalityChecks/KingChecks");
function getKingMoves(gameState, pos, types) {
    const moves = [];
    const board = gameState.board;
    const piece = board.getPiece(pos);
    if (!piece)
        return moves;
    const pseudoLegalKingPositions = FigureOffsets_1.KING_OFFSETS
        .flatMap(offset => {
        const resPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, 'forward', offset);
        if (!resPos)
            return [];
        const pieceOnSquare = board.getPiece(resPos);
        if (pieceOnSquare && (0, gameStateUtils_1.areAllies)(piece, pieceOnSquare))
            return [];
        return [resPos];
    });
    for (const endPos of pseudoLegalKingPositions) {
        const destroyedPiece = board.getPiece(endPos);
        if (!destroyedPiece && (!types || types.includes('move'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), null, 'move', { isPromotion: false }));
        }
        if (destroyedPiece && (!types || types.includes('attackMove'))) {
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, (0, MoveUtils_1.getMove)(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
        }
    }
    if (!types || types.includes('castling')) {
        moves.push(...getCastlingMoves(gameState, pos));
    }
    return moves;
}
function getCastlingMoves(gameState, kingPos) {
    const board = gameState.board;
    const moves = [];
    const piece = board.getPiece(kingPos);
    if (!piece || piece.getPiece() !== 'king') {
        return moves;
    }
    if (!(0, LegalityCheckUtils_1.isFirstMove)(gameState, kingPos) || (0, KingChecks_1.isKingChecked)(gameState, piece.getColor())) {
        return moves;
    }
    // Checking if rooks are on their places
    const dir = (0, gameStateUtils_1.getDirection)(gameState, piece);
    const [leftRookInitPos, rightRookInitPos] = [
        (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: -4, y: 0 }),
        (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: 3, y: 0 }),
    ];
    const [leftRookOnPlace, rightRookOnPlace] = [(0, gameStateUtils_1.containsInitialFigure)(gameState, leftRookInitPos), (0, gameStateUtils_1.containsInitialFigure)(gameState, rightRookInitPos)];
    // Checking the path
    let castlingPossible = true;
    if (leftRookOnPlace) {
        for (let i = 1; i <= 3; i++) {
            const posOnPath = (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: -1 * i, y: 0 });
            if (board.isOccupied(posOnPath)) {
                castlingPossible = false;
                break;
            }
        }
        if (castlingPossible) {
            const move = (0, MoveUtils_1.getMove)(kingPos, (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: -2, y: 0 }));
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'castling', { isPromotion: false }));
        }
    }
    castlingPossible = true;
    if (rightRookOnPlace) {
        for (let i = 1; i <= 2; i++) {
            const posOnPath = (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: i, y: 0 });
            if (board.isOccupied(posOnPath)) {
                castlingPossible = false;
                break;
            }
        }
        if (castlingPossible) {
            const move = (0, MoveUtils_1.getMove)(kingPos, (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', { x: 2, y: 0 }));
            moves.push((0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'castling', { isPromotion: false }));
        }
    }
    return moves;
}
//# sourceMappingURL=KingMovesGenerator.js.map