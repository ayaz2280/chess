import { Board } from "./ChessClass/Board/Board";
import { ChessEngine } from "./ChessClass/ChessEngine/ChessEngine";
import { Figure } from "./ChessClass/Figure/Figure";
import { GameState } from "./ChessClass/types/ChessTypes";

const gameState: GameState = ChessEngine.initGame({player: 'human', opponent: 'human'});

console.log(JSON.stringify(gameState, ['board', 'grid', 'Figure']));