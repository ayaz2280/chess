import { LEGAL_MOVES_CACHE } from "../Cache/Cache";
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
  if (!legalMovesExist() && (!gameState.checked.blackKingChecked || !gameState.checked.whiteKingChecked)) {
    return true;
  }

  return false;
}

function isFiftyMovesRuleBroken(gameState: GameState): boolean {
  return gameState.halfMoveClock >= 100;
}

function legalMovesExist(): boolean {

  //saveMoveCacheToJson(LEGAL_MOVES_CACHE);
  return LEGAL_MOVES_CACHE.keys().length !== 0;
}

export { updateGameStatus };