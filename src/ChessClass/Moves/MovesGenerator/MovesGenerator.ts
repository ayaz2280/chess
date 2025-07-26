

import { PSEUDO_LEGAL_MOVES_CACHE } from "../../Cache/Cache";
import { Figure } from "../../Figure/Figure";
import { initGameStateHash } from "../../GameStateHelperFunctions";
import { getUniqueArray } from "../../HelperFunctions";
import { ActionType, FigureType, GameState, HistoryEntry, Position } from "../../types/ChessTypes";
import { getBishopMoves } from "./FigureMovesGenerators/BishopMovesGenerator";
import { getKingMoves } from "./FigureMovesGenerators/KingMovesGenerator";
import { getKnightMoves } from "./FigureMovesGenerators/KnightMovesGenerator";
import { getPawnMoves } from "./FigureMovesGenerators/PawnMovesGenerator";
import { getQueenMoves } from "./FigureMovesGenerators/QueenMovesGenerator";
import { getRookMoves } from "./FigureMovesGenerators/RookMovesGenerator";

type PseudoLegalMoveGenerator = (gameState: GameState, pos: Position, types?: ActionType[]) => HistoryEntry[];

const PIECE_MOVE_GENERATOR_MAP: Record<FigureType, PseudoLegalMoveGenerator> = {
  'pawn': getPawnMoves,
  'bishop': getBishopMoves,
  'king': getKingMoves,
  'knight': getKnightMoves,
  'queen': getQueenMoves,
  'rook': getRookMoves,
}

/**
 * Returns array of all possible pseudo legal moves for selected piece
 * @param gameState
 * @param position a position of a piece to  obtain legal moves from
 */
function getMoves(gameState: GameState, position: Position, types?: ActionType[]): HistoryEntry[] {
  const uniqueTypes: ActionType[] | undefined = types ? getUniqueArray(types) : undefined;

  let pseudoLegalMoves: HistoryEntry[] | undefined = [];

  if (!gameState.board.grid[position.y][position.x]) return pseudoLegalMoves;

  if (!gameState.hash) initGameStateHash(gameState);

  const typesKey: string = uniqueTypes ? uniqueTypes.join('_') : 'all';

  const key: string = `${gameState.hash}:${position.x}${position.y}:${typesKey}`;

  pseudoLegalMoves = PSEUDO_LEGAL_MOVES_CACHE.get(key);

  if (pseudoLegalMoves) {
    return pseudoLegalMoves;
  }
  pseudoLegalMoves = [];

  const piece: Figure = gameState.board.grid[position.y][position.x] as Figure;

  const pieceType: FigureType = piece.getPiece();


  pseudoLegalMoves.push(...getMovesFor(gameState, position, pieceType, types));

  PSEUDO_LEGAL_MOVES_CACHE.set(key, pseudoLegalMoves);

  return pseudoLegalMoves;
}

function getMovesFor(gameState: GameState, position: Position, figType: FigureType, types?: ActionType[]): HistoryEntry[] {
  const genMoves: PseudoLegalMoveGenerator = PIECE_MOVE_GENERATOR_MAP[figType];
  const entries: HistoryEntry[] = genMoves(gameState, position, types);
  return entries;
} 

export { getMoves };