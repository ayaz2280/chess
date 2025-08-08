import { extractCache, LEGAL_MOVES_CACHE } from "../Cache/Cache";
import { MovesCache } from "../Cache/CacheTypes";
import { ChessEngine } from "../ChessEngine/ChessEngine";
import { ColorType } from "../Player/PlayerTypes";
import { GameState, GameStatus } from "../types/ChessTypes";
import { saveGameStateToJson, saveMoveCacheToJson } from "./jsonUtils";

function updateGameStatus(gameState: GameState) {
  const status: GameStatus = {
    title: 'ongoing',
    reason: undefined,
  } 

  if (isStalemate(gameState)) {
    status.title = 'draw';
    status.reason = 'stalemate';
  } else if (isFiftyMovesRuleBroken(gameState)) {
    status.title = 'draw';
    status.reason = '50 moves rule';
  } else if (isCheckmate(gameState)) {
    const winner: ColorType = gameState.checked.blackKingChecked.checkingPieces.length > 0 ? 'white' : 'black';

    status.title = `${winner} wins`;
    status.reason = 'checkmate';
  }

  gameState.status = status;
}

function isCheckmate(gameState: GameState): boolean {
  if (gameState.checked.blackKingChecked || gameState.checked.whiteKingChecked) {
    if (!legalMovesExist()) {
      return true;
    }
  }
  return false;
}

function isStalemate(gameState: GameState): boolean {
  //saveGameStateToJson(gameState);
  //gameState.board.display();
  const foundLegalMoves: boolean = legalMovesExist();

  if (!foundLegalMoves && (gameState.checked.blackKingChecked.checkingPieces.length === 0 && gameState.checked.whiteKingChecked.checkingPieces.length === 0)) {
    return true;
  }

  return false;
}

function isFiftyMovesRuleBroken(gameState: GameState): boolean {
  return gameState.halfMoveClock >= 100;
}

function legalMovesExist(): boolean {
  const cacheObj: MovesCache = extractCache(LEGAL_MOVES_CACHE);
  
  let foundLegalMoves: boolean = false;

  for (const key in cacheObj) {
    if (cacheObj[key].length > 0) {
      foundLegalMoves = true;
      break;
    }
  }

  return foundLegalMoves;
}

export { updateGameStatus };