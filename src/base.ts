import { assert } from "chai";
import { Board } from "./ChessClass/Board/Board";
import { ChessEngine } from "./ChessClass/ChessEngine/ChessEngine";
import { Figure } from "./ChessClass/Figure/Figure";
import { parseAlgNotation, parseMove } from "./ChessClass/Moves/AlgNotation/AlgNotation";
import { CastlingMoveInfo, GameState, HistoryEntry } from "./ChessClass/types/ChessTypes";
import { isSameMove } from "./ChessClass/utils/MoveUtils";
import { applyMoveDebug } from "./ChessClass/ChessEngine/DebugFunctions";

let board: Board;
let gameState: GameState;

board = new Board();

board.place(new Figure('white', 'king'), parseAlgNotation('e1'));
board.place(new Figure('white', 'rook'), parseAlgNotation('h1'));
board.place(new Figure('white', 'rook'), parseAlgNotation('a1'));
board.place(new Figure('black', 'king'), parseAlgNotation('e8'));

gameState = ChessEngine.initGame({player: 'human', opponent: 'human'}, board.grid, 'white');
board = gameState.board;

const rookMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('h1'));

const rookMoveOneSquareAhead: HistoryEntry | undefined = rookMoves.find(e => isSameMove(e.move, parseMove('h1-h2')));

if (!rookMoveOneSquareAhead) {
  throw new Error('No rook move');
}

ChessEngine.applyMove(gameState, rookMoveOneSquareAhead);

applyMoveDebug(gameState, parseMove('e8-f8'));

const kingMoves: HistoryEntry[] = ChessEngine.getLegalMoves(gameState, parseAlgNotation('e1'));

console.log(kingMoves);

board.display();