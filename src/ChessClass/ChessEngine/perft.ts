import { assert } from "chai";
import { Position } from "../Moves/MoveTypes";
import { GameState, HistoryEntry } from "../types/ChessTypes";
import { ChessEngine } from "./ChessEngine";

function perft(gameState: GameState, depth: number): number {
  assert(Number.isInteger(depth));

  if (depth === 0) {
    return 1;
  }

  let nodes: number = 0;

  const figPositions: Position[] = gameState.board.findFigures('all', gameState.sideToMove);

  figPositions.forEach(pos => {
    const entries: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, pos);


    entries.forEach(entry => {
      ChessEngine.applyMove(gameState, entry);
      nodes += perft(gameState, depth-1);
      ChessEngine.undoLastMove(gameState);
    })
  });

  return nodes;
}

export { perft };