import { extractCache, LEGAL_MOVES_CACHE } from "../ChessClass/Cache/Cache";
import { MovesCache } from "../ChessClass/Cache/CacheTypes";
import { ChessEngine } from "../ChessClass/ChessEngine/ChessEngine";
import { GameState, HistoryEntry, Move, Position } from "../ChessClass/types/ChessTypes";
import { getMovesKey } from "../ChessClass/utils/hashUtils";
import { isSameMove } from "../ChessClass/utils/MoveUtils";

function findCachedMove(gameState: GameState, move: Move): HistoryEntry | undefined {
  const key: string = getMovesKey('legal_moves', gameState, move.start);
  const legalMoves: HistoryEntry[] | undefined = LEGAL_MOVES_CACHE.get(key);

  if (legalMoves === undefined) {
    return undefined;
  }

  return legalMoves.find(e => isSameMove(e.move, move));
}

function getCachedMoves(gameState: GameState, pos: Position) {
  return ChessEngine.getLegalMovesFromCache(gameState, pos);
}

function listCachedMoves(): HistoryEntry[] {
  return Object.values(extractCache(LEGAL_MOVES_CACHE)).flat();
}

export { findCachedMove, listCachedMoves, getCachedMoves };