"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMove = validateMove;
exports.isValidCastlingEntry = isValidCastlingEntry;
exports.filterMoves = filterMoves;
const LegalityCheckUtils_1 = require("../../utils/LegalityCheckUtils");
const MoveUtils_1 = require("../../utils/MoveUtils");
const MovesGenerator_1 = require("../MovesGenerator/MovesGenerator");
const KingChecks_1 = require("./KingChecks");
/**
 * Checks if *move* is valid. Method works through searching *move* in result of *getMoves* method, therefore it's strictly **forbidden** to use in *getMoves* method and its alikes, e.g. *getPawnMoves*, *getKnightMoves*, etc
 * @param gameState
 * @param move
 * @returns
 */
function validateMove(gameState, move) {
    const moves = (0, MovesGenerator_1.getMoves)(gameState, move.start);
    const entry = moves.find(mi => (0, MoveUtils_1.isSameMove)(move, mi.move));
    if (!entry)
        return null;
    if (entry.type === 'castling') {
        const castlingEntry = entry;
        if (isValidCastlingEntry(gameState, castlingEntry)) {
            return castlingEntry;
        }
    }
    if (!(0, KingChecks_1.isKingAttackedAfterMove)(gameState, entry.player.getColor(), entry.move)) {
        return entry;
    }
    return null;
}
function isValidCastlingEntry(gameState, castlingEntry) {
    const board = gameState.board;
    if ('castling' !== castlingEntry.type) {
        return false;
    }
    if ((0, KingChecks_1.isKingChecked)(gameState, castlingEntry.player.getColor())) {
        return false;
    }
    const color = castlingEntry.player.getColor();
    const rookPos = castlingEntry.rookMove.start;
    const rook = board.getPiece(rookPos);
    if (!rook || castlingEntry.rookPiece !== rook)
        return false;
    if (!(0, LegalityCheckUtils_1.isFirstMove)(gameState, rookPos)) {
        return false;
    }
    const kingPos = castlingEntry.move.start;
    const king = board.getPiece(kingPos);
    if (!king || castlingEntry.piece !== king) {
        return false;
    }
    if (!(0, LegalityCheckUtils_1.isFirstMove)(gameState, kingPos)) {
        return false;
    }
    const isKingSideCastling = (0, MoveUtils_1.getMoveOffset)(castlingEntry.move).x > 0;
    let castlingPossible = true;
    if (isKingSideCastling) {
        for (let i = 1; i <= 2; i++) {
            const posOnPath = (0, MoveUtils_1.getPositionRelativeTo)(castlingEntry.move.start, 'forward', { x: i, y: 0 });
            if (board.isOccupied(posOnPath) || (0, KingChecks_1.isKingAttackedAfterMove)(gameState, castlingEntry.player.getColor(), (0, MoveUtils_1.getMove)(kingPos, posOnPath))) {
                return false;
            }
        }
    }
    else {
        for (let i = -1; i >= -3; i--) {
            const posOnPath = (0, MoveUtils_1.getPositionRelativeTo)(castlingEntry.move.start, 'forward', { x: i, y: 0 });
            if (board.isOccupied(posOnPath) || (0, KingChecks_1.isKingAttackedAfterMove)(gameState, castlingEntry.player.getColor(), (0, MoveUtils_1.getMove)(kingPos, posOnPath))) {
                return false;
            }
        }
    }
    return true;
}
function filterMoves(gameState, entries) {
    return entries.filter(entry => validateMove(gameState, entry.move) ? true : false);
}
//# sourceMappingURL=LegalMoveValidation.js.map