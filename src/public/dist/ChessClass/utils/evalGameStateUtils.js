"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnPassantFile = getEnPassantFile;
exports.requestCastlingRights = requestCastlingRights;
exports.hasCastlingRight = hasCastlingRight;
const AlgNotation_1 = require("../Moves/AlgNotation/AlgNotation");
const LegalityCheckUtils_1 = require("./LegalityCheckUtils");
const MoveUtils_1 = require("./MoveUtils");
function getEnPassantFile(gameState) {
    if (gameState.moveHistory.length === 0)
        return null;
    const lastEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
    const moveOffset = (0, MoveUtils_1.getMoveOffset)(lastEntry.move);
    if (lastEntry.piece.getPiece() !== 'pawn' || !(Math.abs(moveOffset.y) === 2 && Math.abs(moveOffset.x) === 0)) {
        return null;
    }
    const file = lastEntry.move.end.x;
    return file;
}
function requestCastlingRights(gameState) {
    const board = gameState.board;
    const whiteKingPositions = board.findFigures(['king'], 'white');
    const blackKingPositions = board.findFigures(['king'], 'black');
    if (whiteKingPositions.length !== 1 || blackKingPositions.length !== 1) {
        return {
            white: { 'kingSide': false, 'queenSide': false },
            black: { 'kingSide': false, 'queenSide': false },
        };
    }
    const whiteKingPos = whiteKingPositions[0];
    const blackKingPos = blackKingPositions[0];
    const castlingRights = {
        white: {
            queenSide: hasCastlingRight(gameState, 'white', 'queenSide'),
            kingSide: hasCastlingRight(gameState, 'white', 'kingSide'),
        },
        black: {
            queenSide: hasCastlingRight(gameState, 'black', 'queenSide'),
            kingSide: hasCastlingRight(gameState, 'black', 'kingSide'),
        }
    };
    return castlingRights;
}
/**
   * Returns whether the king of *playerColor* may castle from *side* now or in the future.
   * @param gameState
   * @param playerColor
   * @param side
   * @returns
   */
function hasCastlingRight(gameState, playerColor, side) {
    const board = gameState.board;
    const kingPos = board.findFigures(['king'], playerColor)[0];
    if (!(0, LegalityCheckUtils_1.isFirstMove)(gameState, kingPos)) {
        return false;
    }
    const expectedRookPos = (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', side === 'kingSide' ? (0, MoveUtils_1.getMoveOffset)((0, AlgNotation_1.parseMove)('e1-h1')) : (0, MoveUtils_1.getMoveOffset)((0, AlgNotation_1.parseMove)('e1-a1')));
    const rookPos = board.findFigures(['rook'], playerColor).find(pos => (0, MoveUtils_1.isSamePos)(expectedRookPos, pos));
    if (!rookPos)
        return false;
    if (!(0, LegalityCheckUtils_1.isFirstMove)(gameState, rookPos))
        return false;
    return true;
}
//# sourceMappingURL=evalGameStateUtils.js.map