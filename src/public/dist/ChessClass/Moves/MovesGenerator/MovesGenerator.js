"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoves = getMoves;
const Cache_1 = require("../../Cache/Cache");
const utils_1 = require("../../utils/utils");
const BishopMovesGenerator_1 = require("./FigureMovesGenerators/BishopMovesGenerator");
const KingMovesGenerator_1 = require("./FigureMovesGenerators/KingMovesGenerator");
const KnightMovesGenerator_1 = require("./FigureMovesGenerators/KnightMovesGenerator");
const PawnMovesGenerator_1 = require("./FigureMovesGenerators/PawnMovesGenerator");
const QueenMovesGenerator_1 = require("./FigureMovesGenerators/QueenMovesGenerator");
const RookMovesGenerator_1 = require("./FigureMovesGenerators/RookMovesGenerator");
const HashFunctions_1 = require("../../Hashing/HashFunctions");
const PIECE_MOVE_GENERATOR_MAP = {
    'pawn': PawnMovesGenerator_1.getPawnMoves,
    'bishop': BishopMovesGenerator_1.getBishopMoves,
    'king': KingMovesGenerator_1.getKingMoves,
    'knight': KnightMovesGenerator_1.getKnightMoves,
    'queen': QueenMovesGenerator_1.getQueenMoves,
    'rook': RookMovesGenerator_1.getRookMoves,
};
/**
 * Returns array of all possible pseudo legal moves for selected piece
 * @param gameState
 * @param position a position of a piece to  obtain legal moves from
 */
function getMoves(gameState, position, types) {
    const uniqueTypes = types ? (0, utils_1.getUniqueArray)(types) : undefined;
    let pseudoLegalMoves = [];
    if (!gameState.board.grid[position.y][position.x])
        return pseudoLegalMoves;
    if (!gameState.hash)
        (0, HashFunctions_1.initGameStateHash)(gameState);
    const typesKey = uniqueTypes ? uniqueTypes.join('_') : 'all';
    const key = `${gameState.hash}:${position.x}${position.y}:${typesKey}`;
    pseudoLegalMoves = Cache_1.PSEUDO_LEGAL_MOVES_CACHE.get(key);
    if (pseudoLegalMoves) {
        return pseudoLegalMoves;
    }
    pseudoLegalMoves = [];
    const piece = gameState.board.grid[position.y][position.x];
    const pieceType = piece.getPiece();
    pseudoLegalMoves.push(...getMovesFor(gameState, position, pieceType, types));
    Cache_1.PSEUDO_LEGAL_MOVES_CACHE.set(key, pseudoLegalMoves);
    return pseudoLegalMoves;
}
function getMovesFor(gameState, position, figType, types) {
    const genMoves = PIECE_MOVE_GENERATOR_MAP[figType];
    const entries = genMoves(gameState, position, types);
    return entries;
}
//# sourceMappingURL=MovesGenerator.js.map