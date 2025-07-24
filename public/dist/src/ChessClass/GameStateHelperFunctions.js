"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGameStateHash = initGameStateHash;
exports.cloneGameState = cloneGameState;
exports.moveToAlgNotation = moveToAlgNotation;
const Board_1 = require("./Board");
const ChessEngine_1 = require("./ChessEngine");
const HelperFunctions_1 = require("./HelperFunctions");
const Player_1 = require("./Player");
function cloneGameState(gameState) {
    const newGameState = {
        player: gameState.player.playerType === 'human' ? new Player_1.HumanPlayer(gameState.player.getColor()) : new Player_1.ComputerPlayer(gameState.player.getColor()),
        opponent: gameState.opponent.playerType === 'human' ? new Player_1.HumanPlayer(gameState.opponent.getColor()) : new Player_1.ComputerPlayer(gameState.opponent.getColor()),
        board: new Board_1.Board(gameState.board.grid),
        moveHistory: new Array(...gameState.moveHistory),
        checked: {
            whiteKingChecked: gameState.checked.whiteKingChecked,
            blackKingChecked: gameState.checked.blackKingChecked,
        },
        enPassantTargetFile: gameState.enPassantTargetFile,
        castlingRights: structuredClone(gameState.castlingRights),
    };
    if (gameState.hash) {
        newGameState.hash = gameState.hash;
    }
    return newGameState;
}
function initGameStateHash(gameState) {
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
            gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(piece.getColor(), piece.getPiece(), pos);
        }
    }
    // the side to move is black
    if (gameState.moveHistory.length !== 0 && gameState.moveHistory[gameState.moveHistory.length - 1].player.getColor() === 'white') {
        gameState.hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
    }
    const castlingRightsNumbers = (0, HelperFunctions_1.getCastlingRightsNumbers)();
    const castlingRights = ChessEngine_1.ChessEngine.requestCastlingRights(gameState);
    const castlingRightsArr = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];
    castlingRightsArr.forEach((castlingRight, id) => {
        if (castlingRight) {
            gameState.hash ^= castlingRightsNumbers[id];
        }
    });
    const enPassantFile = ChessEngine_1.ChessEngine.getEnPassantFile(gameState);
    if (enPassantFile) {
        gameState.hash ^= (0, HelperFunctions_1.getFilesEnPassantNumbers)()[enPassantFile];
    }
    return gameState.hash;
}
function recalculateHash(gameState, newEntry) {
    if (!gameState.hash) {
        gameState.hash = initGameStateHash(gameState);
    }
    const move = newEntry.move;
    const board = gameState.board;
    const pieceOnStart = board.getPiece(move.start);
    if (pieceOnStart === null) {
        throw new Error(`Error Hashing: no figure on start pos { x: ${move.start}, y: ${move.end.y}}`);
    }
    const movingPieceNum = (0, HelperFunctions_1.getPieceNumber)(pieceOnStart.getColor(), pieceOnStart.getPiece(), move.start);
    return gameState.hash;
}
function moveToAlgNotation(HistoryEntry) {
    if (!(0, HelperFunctions_1.moveInGrid)(HistoryEntry.move)) {
        throw new Error(`Move's not in grid ${HistoryEntry.move}`);
    }
    return `${Board_1.Board.getPieceString(HistoryEntry.piece)} ${(0, HelperFunctions_1.posToAlgNotation)(HistoryEntry.move.start)}-${(0, HelperFunctions_1.posToAlgNotation)(HistoryEntry.move.end)}`;
}
//# sourceMappingURL=GameStateHelperFunctions.js.map