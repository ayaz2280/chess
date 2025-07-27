"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateMove = simulateMove;
const MoveUtils_1 = require("../../utils/MoveUtils");
const gameStateUtils_1 = require("../../utils/gameStateUtils");
const MovesGenerator_1 = require("../MovesGenerator/MovesGenerator");
// FUNCTION IS TO BE REVIEWED
/**
   * Simulates a move and returns a new gameState object with move applied
   * @returns a new GameState object or null
   */
function simulateMove(gameState, move) {
    const newGameState = (0, gameStateUtils_1.cloneGameState)(gameState);
    //console.log(newGameState);
    const entry = (0, MovesGenerator_1.getMoves)(newGameState, move.start).find(e => (0, MoveUtils_1.isSameMove)(e.move, move));
    if (!entry)
        return null;
    const success = newGameState.board.move(move);
    if (!success) {
        return null;
    }
    if (entry.type === 'castling') {
        const castlingEntry = entry;
        newGameState.board.move(castlingEntry.rookMove);
        newGameState.moveHistory.push(castlingEntry);
    }
    else {
        newGameState.moveHistory.push(entry);
    }
    if (entry.destroyedPiece) {
        const destroyedPiecePos = (0, gameStateUtils_1.getPiecePosition)(newGameState, entry.destroyedPiece);
        if (destroyedPiecePos) {
            newGameState.board.removePiece(destroyedPiecePos);
        }
    }
    return success ? newGameState : null;
}
//# sourceMappingURL=SimulateMove.js.map