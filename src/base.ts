import { ChessEngine } from "./ChessClass/ChessEngine/ChessEngine";


import { parseAlgNotation } from "./ChessClass/Moves/AlgNotation/AlgNotation";
import { GameState, HistoryEntry } from "./ChessClass/types/ChessTypes";



declare global {
  var gameState: GameState;
}

const gameState: GameState = ChessEngine.initGame({player: 'human',opponent: 'human'});

gameState.board.display();

const moves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('a2'));

console.log(...moves.map(e => e.move));

console.log('hello world, bitch!');