"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAR_TO_FIGURE_MAP = void 0;
exports.getDirection = getDirection;
exports.getPlayer = getPlayer;
exports.isRankEndOfBoard = isRankEndOfBoard;
exports.canAttackSquare = canAttackSquare;
exports.areAllies = areAllies;
exports.containsInitialFigure = containsInitialFigure;
exports.nextSideToMove = nextSideToMove;
exports.isPieceOnEndOfBoard = isPieceOnEndOfBoard;
exports.getPiecePosition = getPiecePosition;
exports.flipSideToMove = flipSideToMove;
exports.getDestroyedPiece = getDestroyedPiece;
exports.cloneGameState = cloneGameState;
const Player_1 = require("../Player/Player");
const MoveUtils_1 = require("./MoveUtils");
const MoveUtils_2 = require("./MoveUtils");
const Board_1 = require("../Board/Board");
const HashConstants_1 = require("../Hashing/HashConstants");
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
        halfMoveClock: gameState.halfMoveClock,
        sideToMove: gameState.sideToMove,
        fullMoveCounter: gameState.fullMoveCounter,
    };
    if (gameState.hash !== undefined) {
        newGameState.hash = gameState.hash;
    }
    return newGameState;
}
function getDirection(gameState, piece) {
    return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
}
function getPlayer(gameState, color) {
    return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
}
function isRankEndOfBoard(gameState, rank, side) {
    return gameState.player.getColor() === side ? rank === 7 : rank === 0;
}
function canAttackSquare(gameState, attackerPos, squareToAttack, attackingOffset) {
    const board = gameState.board;
    const piece = board.getPiece(attackerPos);
    if (!piece)
        return false;
    const piece2 = board.getPiece(squareToAttack);
    if (!piece2)
        return false;
    if (areAllies(piece, piece2))
        return false;
    const calculatedSquare = (0, MoveUtils_2.getPositionRelativeTo)(attackerPos, getDirection(gameState, piece), attackingOffset);
    if (!calculatedSquare || !(0, MoveUtils_1.isSamePos)(calculatedSquare, squareToAttack))
        return false;
    return true;
}
function areAllies(p1, p2) {
    return p1.getColor() === p2.getColor();
}
/**
 * Checks if piece from *initPos* has ever moved from the start of the game.
 * @param gameState
 * @param initPos
 */
function containsInitialFigure(gameState, initPos) {
    if (gameState.moveHistory.length === 0) {
        return gameState.board.getPiece(initPos) ? true : false;
    }
    if (gameState.moveHistory[0].board.getPiece(initPos) === gameState.board.getPiece(initPos))
        return true;
    return false;
}
function nextSideToMove(gameState) {
    const moveHistory = gameState.moveHistory;
    if (moveHistory.length === 0) {
        return 'white';
    }
    const lastEntry = moveHistory[moveHistory.length - 1];
    return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
}
function isPieceOnEndOfBoard(gameState, pos) {
    const board = gameState.board;
    const piece = board.getPiece(pos);
    if (!piece) {
        return false;
    }
    const dir = getDirection(gameState, piece);
    return (0, MoveUtils_2.getPositionRelativeTo)(pos, dir, { x: 0, y: 1 }) ? false : true;
}
function getPiecePosition(gameState, piece) {
    for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
            if (piece === gameState.board.grid[y][x]) {
                return { x: x, y: y };
            }
        }
    }
    return null;
}
function flipSideToMove(gameState) {
    gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
    gameState.hash ^= HashConstants_1.HASH_SIDE_TO_MOVE_NUMBER;
}
function getDestroyedPiece(gameState, attackerPiece, move) {
    const board = gameState.board;
    if (!attackerPiece)
        return null;
    const player = getPlayer(gameState, attackerPiece.getColor());
    const pieceToBeDestroyed = board.getPiece(move.end);
    if (!pieceToBeDestroyed)
        return null;
    if (areAllies(attackerPiece, pieceToBeDestroyed))
        return null;
    return pieceToBeDestroyed;
}
exports.CHAR_TO_FIGURE_MAP = {
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
    p: 'pawn'
};
//# sourceMappingURL=gameStateUtils.js.map