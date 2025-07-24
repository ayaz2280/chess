import {GameState, BaseMoveInfo} from '../ChessClass/types/ChessTypes';

export type GameManagerEvents = {
  'gameStateChanged': (gameState: GameState) => void;
  'invalidMove': (moveInfo: BaseMoveInfo) => void;
  'gameStarted': () => void;
}