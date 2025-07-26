"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPawnMoves = getPawnMoves;
exports.getEnPassantPos = getEnPassantPos;
const GameStateHelperFunctions_1 = require("../../../GameStateHelperFunctions");
const MoveUtils_1 = require("../../../utils/MoveUtils");
const historyUtils_1 = require("../../../utils/historyUtils");
const gameStateUtils_1 = require("../../../utils/gameStateUtils");
function getPawnMoves(gameState, pos, types) {
    const board = gameState.board;
    const piece = board.grid[pos.y][pos.x];
    let entry;
    let move;
    if (!piece || !(piece.getPiece() === 'pawn'))
        return [];
    const moves = [];
    const dir = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
    let isPromotionMove = false;
    // moves of type 'move'
    if (!types ||
        types.includes('move')) {
        if ((0, GameStateHelperFunctions_1.isFirstMove)(gameState, pos)) {
            const offset = {
                x: 0,
                y: 2,
            };
            const twoSquareAhead = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, offset);
            const oneSquareAhead = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, { x: 0, y: 1 });
            if (twoSquareAhead &&
                !board.isOccupied(twoSquareAhead) &&
                !board.isOccupied(oneSquareAhead)) {
                move = (0, MoveUtils_1.getMove)(pos, twoSquareAhead);
                entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'move', { isPromotion: false });
                if (entry) {
                    moves.push(entry);
                }
            }
        }
        // check for 1 square move
        const oneSquareAhead = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, {
            x: 0,
            y: 1,
        });
        if (oneSquareAhead) {
            const moveOneSquare = {
                start: pos,
                end: oneSquareAhead,
            };
            if (!board.isOccupied(oneSquareAhead)) {
                move = (0, MoveUtils_1.getMove)(pos, oneSquareAhead);
                if ((0, gameStateUtils_1.isRankEndOfBoard)(gameState, oneSquareAhead.y, piece.getColor())) {
                    const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                    figureTypes.forEach((figType) => {
                        entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });
                        if (entry) {
                            moves.push(entry);
                        }
                    });
                }
                else {
                    entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'move', { isPromotion: false });
                    if (entry) {
                        moves.push(entry);
                    }
                }
            }
        }
    }
    // moves of type 'attackMove'
    if (!types ||
        types.includes('attackMove')) {
        // check for diagonal attacking moves
        const leftDiagonalOffset = {
            x: -1,
            y: 1,
        };
        const rightDiagonalOffset = {
            x: 1,
            y: 1,
        };
        const leftDiagonal = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, leftDiagonalOffset);
        const rightDiagonal = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, rightDiagonalOffset);
        if (leftDiagonal) {
            if ((0, gameStateUtils_1.canAttackSquare)(gameState, pos, leftDiagonal, leftDiagonalOffset)) {
                move = (0, MoveUtils_1.getMove)(pos, leftDiagonal);
                if ((0, gameStateUtils_1.isRankEndOfBoard)(gameState, leftDiagonal.y, piece.getColor())) {
                    const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                    figureTypes.forEach((figType) => {
                        entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });
                        if (entry) {
                            moves.push(entry);
                        }
                    });
                }
                else {
                    entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, null, 'move', { isPromotion: false });
                    if (entry) {
                        moves.push(entry);
                    }
                }
            }
        }
        if (rightDiagonal) {
            if ((0, gameStateUtils_1.canAttackSquare)(gameState, pos, rightDiagonal, rightDiagonalOffset)) {
                move = (0, MoveUtils_1.getMove)(pos, rightDiagonal);
                const destroyedPiece = (0, GameStateHelperFunctions_1.getFigure)(gameState, move.end);
                if ((0, gameStateUtils_1.isRankEndOfBoard)(gameState, rightDiagonal.y, piece.getColor())) {
                    const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                    figureTypes.forEach((figType) => {
                        entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, destroyedPiece, 'attackMove', { isPromotion: true, promotedTo: figType });
                        if (entry) {
                            moves.push(entry);
                        }
                    });
                }
                else {
                    entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, destroyedPiece, 'attackMove', { isPromotion: false });
                    if (entry) {
                        moves.push(entry);
                    }
                }
            }
        }
    }
    // moves of type en passant
    if (!types || types.includes('enPassant')) {
        const enPassantPos = getEnPassantPos(gameState, pos);
        if (enPassantPos) {
            move = (0, MoveUtils_1.getMove)(pos, enPassantPos);
            entry = (0, historyUtils_1.buildHistoryEntry)(gameState, move, (0, GameStateHelperFunctions_1.getFigure)(gameState, (0, MoveUtils_1.getPositionRelativeTo)(enPassantPos, dir, { x: 0, y: -1 })), 'enPassant', { isPromotion: false });
            if (entry) {
                moves.push(entry);
            }
        }
    }
    return moves;
}
function getEnPassantPos(gameState, pos) {
    const piece = (0, GameStateHelperFunctions_1.getFigure)(gameState, pos);
    if (!piece || piece.getPiece() !== 'pawn')
        return null;
    if (gameState.moveHistory.length === 0)
        return null;
    const dir = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
    const leftOffset = {
        x: -1,
        y: 0,
    };
    const rightOffset = {
        x: 1,
        y: 0,
    };
    const leftPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, leftOffset);
    const rightPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, rightOffset);
    const lastHistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
    const moveOffset = (0, MoveUtils_1.getMoveOffset)(lastHistoryEntry.move, (0, gameStateUtils_1.getDirection)(gameState, lastHistoryEntry.piece));
    if (lastHistoryEntry.piece.getPiece() !== 'pawn' ||
        !(moveOffset.x === 0 && moveOffset.y === 2)) {
        return null;
    }
    if (leftPos) {
        const leftPawn = (0, GameStateHelperFunctions_1.getFigure)(gameState, leftPos);
        if (leftPawn && leftPawn === lastHistoryEntry.piece) {
            const enPassantOffset = { x: -1, y: 1 };
            const enPassantPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, enPassantOffset);
            const enPassantMove = {
                start: pos,
                end: enPassantPos,
            };
            return enPassantPos;
        }
    }
    if (rightPos) {
        const rightPawn = (0, GameStateHelperFunctions_1.getFigure)(gameState, rightPos);
        if (rightPawn && rightPawn === lastHistoryEntry.piece) {
            const enPassantOffset = { x: 1, y: 1 };
            const enPassantPos = (0, MoveUtils_1.getPositionRelativeTo)(pos, dir, enPassantOffset);
            const enPassantMove = {
                start: pos,
                end: enPassantPos,
            };
            return enPassantPos;
        }
    }
    return null;
}
//# sourceMappingURL=PawnMovesGenerator.js.map