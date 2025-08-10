import { GameState, GameStatus, HistoryEntry, LegalMovesMap, Move, Position, PositionKey, ReasonStatus } from "../ChessClass/types/ChessTypes";
import { InitGameInfo } from "../ChessClass/types/InitGameTypes";
import { ChessEngine } from "../ChessClass/ChessEngine/ChessEngine";
import { listCachedMoves } from "./utils";
import { isSameMove } from "../ChessClass/utils/MoveUtils";
import { updateChecks } from "../ChessClass/Moves/LegalityChecks/KingChecks";
import { updateGameStatus } from "../ChessClass/utils/GameStatusUtils";
import { saveMoveCacheToJson } from "../ChessClass/utils/jsonUtils";
import { extractCache, flushAllCaches, LEGAL_MOVES_CACHE } from "../ChessClass/Cache/Cache";
import { Player } from "../ChessClass/Player/Player";
import { MovesCache } from "../ChessClass/Cache/CacheTypes";
import { getMovesKey, getPosKey } from "../ChessClass/utils/hashUtils";

class GameController {
  static startGame(gameInfo: InitGameInfo): GameState {
    return ChessEngine.initGame(gameInfo);
  }

  // checks if the move among the legal moves, and if it is, applies a move. otherwise does nothing
  static makeMove(gameState: GameState, move: Move): boolean {
    if (gameState.status.title !== 'ongoing') {
      return false;
    }

    const legalMoves: HistoryEntry[] = listCachedMoves();
    
    const legalMove: HistoryEntry | undefined = legalMoves.find(e => {
      const toBeBroken: boolean = isSameMove(move, {start: {x: 2, y: 2}, end: {x: 1, y: 0}});

      return isSameMove(move, e.move);
    });

    if (legalMove === undefined) {
      return false;
    }

    ChessEngine.applyMove(gameState, legalMove);

    updateChecks(gameState);

    ChessEngine.updateLegalMovesCache(gameState);

    updateGameStatus(gameState);

    return true;
  }

  static unmakeMove(gameState: GameState): void {
    ChessEngine.undoLastMove(gameState);

    ChessEngine.updateLegalMovesCache(gameState);

    updateGameStatus(gameState);
  }

  static endGame(gameState: GameState, winner: Player, reason: ReasonStatus): void {
    const endStatus: GameStatus = {
      title: `${winner.getColor()} wins`,
      reason: reason,
    }

    gameState.status = endStatus;
    flushAllCaches();
  }

  static getLegalMoves(gameState: GameState, pos?: Position): LegalMovesMap {
    const legalMovesMap: LegalMovesMap = {};
    if (pos) {
      const posKey: PositionKey = getPosKey(pos);  
      legalMovesMap[posKey] = LEGAL_MOVES_CACHE.get(getMovesKey('legal_moves', gameState, pos)) ?? [];
      return legalMovesMap;
    }

    const cacheObj: MovesCache = extractCache(LEGAL_MOVES_CACHE);
    const keys: string[] = Object.keys(cacheObj);

    const regexp: RegExp = new RegExp(`${gameState.hash}`, 'gm');
    const keysWeNeed: string[] = keys.filter(k => {
      const isGood: boolean = k.match(regexp) !== null;
      if (!isGood) {
        //console.log(`${k} ${gameState.hash}`);
      }
      return isGood;
    });
  
    keysWeNeed.forEach(k => {
      const posStr: string = k.match(/x\d:y\d/gm)![0].replace(':','_');
      const posKey: PositionKey = posStr as PositionKey;
      legalMovesMap[posKey] = cacheObj[k];
    })

    return legalMovesMap;
  }
}

export { GameController };