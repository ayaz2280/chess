"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHistoryEntry = buildHistoryEntry;
exports.isHalfMove = isHalfMove;
const Board_1 = require("../Board/Board");
const AlgNotation_1 = require("../Moves/AlgNotation/AlgNotation");
const gameStateUtils_1 = require("./gameStateUtils");
const MoveUtils_1 = require("./MoveUtils");
function buildHistoryEntry(gameState, move, destroyedPiece, actionType, promotionDetails) {
    const piece = gameState.board.getPiece(move.start);
    if (!piece)
        return null;
    const player = (0, gameStateUtils_1.getPlayer)(gameState, piece.getColor());
    const opponentColor = player.getColor() === 'white' ? 'black' : 'white';
    const board = new Board_1.Board();
    board.grid = Board_1.Board.cloneGrid(gameState.board.grid, false);
    const lastEntry = gameState.moveHistory.length === 0 ? undefined : gameState.moveHistory[gameState.moveHistory.length - 1];
    let historyEntry = {
        type: actionType,
        player: player,
        board: board,
        piece: piece,
        move: move,
        destroyedPiece: destroyedPiece,
        opponentKingChecked: false,
        prevDetails: {
            prevHalfMoveClock: lastEntry
                ? gameState.halfMoveClock
                : 0,
            prevFullMoveCounter: gameState.fullMoveCounter,
        },
        promotionDetails: { ...promotionDetails },
    };
    if (actionType === 'castling') {
        const isRightRook = (0, MoveUtils_1.getMoveOffset)(move).x > 0 ? true : false;
        const rookPos = (0, AlgNotation_1.parseAlgNotation)(piece.getColor() === gameState.player.getColor()
            ? isRightRook ? 'h1' : 'a1'
            : isRightRook ? 'h8' : 'a8');
        const rook = board.getPiece(rookPos);
        if (!rook)
            throw new Error('Rook not found');
        const rookMove = (0, MoveUtils_1.getMove)(rookPos, (0, MoveUtils_1.getPositionRelativeTo)(rookPos, 'forward', { x: isRightRook ? -2 : 3, y: 0 }));
        const castlingDetails = `${rook.getColor() === 'white' ? 'w' : 'b'}${isRightRook ? 'k' : 'q'}`;
        const castlingEntry = {
            ...historyEntry,
            rookPiece: rook,
            rookMove: rookMove,
            castlingDetails: castlingDetails,
        };
        return castlingEntry;
    }
    if (actionType === 'enPassant') {
        const moveOffset = { x: 0, y: -1 };
        const capturedPawnSquare = (0, MoveUtils_1.getPositionRelativeTo)(move.end, (0, gameStateUtils_1.getDirection)(gameState, piece), moveOffset);
        historyEntry.enPassantCapturedSquare = capturedPawnSquare;
    }
    return historyEntry;
}
function isHalfMove(entry) {
    if (entry.type === 'attackMove' || entry.type === 'checkmate' || entry.type === 'enPassant') {
        return false;
    }
    if (entry.piece.getPiece() === 'pawn') {
        return false;
    }
    return true;
}
//# sourceMappingURL=historyUtils.js.map