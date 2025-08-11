import { assert } from "chai";
import { Position } from "../LegacyMoves/MoveTypes";
import { GameState, HistoryEntry, LegalMovesMap } from "../types/ChessTypes";
import { ChessEngine } from "./ChessEngine";
import { listCachedMoves } from "../../GameController/utils";
import { GameController } from "../../GameController/GameController";

function perft(gameState: GameState, depth: number): number {
  assert(Number.isInteger(depth));

  if (depth === 0) {
    return 1;
  }

  let nodes: number = 0;

  const entries: HistoryEntry[] = Object.values(GameController.getLegalMoves(gameState)).flat(2);

  entries.forEach(entry => {
    GameController.makeMove(gameState, entry.move);
    nodes += perft(gameState, depth-1);
    
    GameController.unmakeMove(gameState);
  })

  return nodes;
}

export { perft };