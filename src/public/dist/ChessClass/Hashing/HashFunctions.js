"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGameStateHash = initGameStateHash;
exports.calculateHash = calculateHash;
const evalGameStateUtils_1 = require("../utils/evalGameStateUtils");
const HashConstants_1 = require("./HashConstants");
function initGameStateHash(gameState, enPassantFile) {
    if (gameState.hash) {
        return gameState.hash;
    }
    gameState.hash = 0n;
    const board = gameState.board;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pos = { x: x, y: y };
            const piece = board.getPiece(pos);
            if (!piece)
                continue;
            gameState.hash ^= (0, HashConstants_1.getPieceNumber)(piece.getColor(), piece.getPiece(), pos);
        }
    }
    // the side to move is black
    if (gameState.sideToMove === 'black') {
        gameState.hash ^= HashConstants_1.HASH_SIDE_TO_MOVE_NUMBER;
    }
    const castlingRights = (0, evalGameStateUtils_1.requestCastlingRights)(gameState);
    const castlingRightsArr = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];
    castlingRightsArr.forEach((castlingRight, id) => {
        if (castlingRight) {
            gameState.hash ^= HashConstants_1.HASH_CASTLING_RIGHTS_NUMBERS[id];
        }
    });
    const enPassantTargetFile = enPassantFile ?? (0, evalGameStateUtils_1.getEnPassantFile)(gameState);
    if (enPassantTargetFile) {
        gameState.hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[enPassantTargetFile];
    }
    return gameState.hash;
}
function calculateHash(gameState) {
    let hash = 0n;
    const board = gameState.board;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pos = { x: x, y: y };
            const piece = board.getPiece(pos);
            if (!piece)
                continue;
            hash ^= (0, HashConstants_1.getPieceNumber)(piece.getColor(), piece.getPiece(), pos);
        }
    }
    // the side to move is black
    if (gameState.moveHistory.length !== 0 && gameState.moveHistory[gameState.moveHistory.length - 1].player.getColor() === 'white') {
        hash ^= HashConstants_1.HASH_SIDE_TO_MOVE_NUMBER;
    }
    const castlingRights = (0, evalGameStateUtils_1.requestCastlingRights)(gameState);
    const castlingRightsArr = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];
    castlingRightsArr.forEach((castlingRight, id) => {
        if (castlingRight) {
            hash ^= HashConstants_1.HASH_CASTLING_RIGHTS_NUMBERS[id];
        }
    });
    const enPassantFile = (0, evalGameStateUtils_1.getEnPassantFile)(gameState);
    if (enPassantFile) {
        hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[enPassantFile];
    }
    return hash;
}
//# sourceMappingURL=HashFunctions.js.map