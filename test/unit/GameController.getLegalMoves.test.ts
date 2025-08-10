import { LEGAL_MOVES_CACHE } from "../../src/ChessClass/Cache/Cache";
import { GameState, LegalMovesMap } from "../../src/ChessClass/types/ChessTypes";
import { saveLegalMovesMapToJson, saveMoveCacheToJson } from "../../src/ChessClass/utils/jsonUtils";
import { GameController } from "../../src/GameController/GameController";

describe('GameController.getLegalMoves', () => {
  let gameState: GameState;

  it('should return 20 legal moves for init position', () => {
    gameState = GameController.startGame({playerDetails: {player: 'human', opponent: 'human'}});

    saveMoveCacheToJson(LEGAL_MOVES_CACHE);

    const legalMovesMap: LegalMovesMap = GameController.getLegalMoves(gameState);

    saveLegalMovesMapToJson(legalMovesMap);

    //console.log(legalMovesMap);
  });
});