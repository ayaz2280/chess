import { assert } from "chai";
import { Board } from "./ChessClass/Board/Board";
import { ChessEngine } from "./ChessClass/ChessEngine/ChessEngine";
import { BISHOP_OFFSET_PATHS, PSEUDO_RANDOM_NUMBERS, QUEEN_OFFSET_PATHS, ROOK_OFFSET_PATHS } from "./ChessClass/constants";
import { Figure } from "./ChessClass/Figure/Figure";
import { GameManager } from "./ChessClass/GameManager";
import { getPieceNumber, parseAlgNotation, parseMove } from "./ChessClass/HelperFunctions";
import { calculateHash, cloneGameState, moveToAlgNotation } from "./ChessClass/GameStateHelperFunctions";
import { GameState, BaseMoveInfo, HistoryEntry, CastlingRights } from "./ChessClass/types/ChessTypes";
import { Move, Position } from "./ChessClass/Moves/MoveTypes";
import { generate64BitRandomNumber } from "./ChessClass/Random";
import { initGameStateHash } from "./ChessClass/GameStateHelperFunctions";


declare global {
  var gameState: GameState;
}

const gameState: GameState = ChessEngine.initGame({player: 'human',opponent: 'human'});

gameState.board.display();

const moves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('a2'));

console.log(...moves.map(e => e.move));

console.log('hello world, bitch!');