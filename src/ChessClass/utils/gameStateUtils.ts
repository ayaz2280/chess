import { Direction, Move, Position } from "../Moves/MoveTypes";
import { Figure } from "../Figure/Figure";
import { GameState, HistoryEntry } from "../types/ChessTypes";
import { ComputerPlayer, HumanPlayer, Player } from "../Player/Player";
import { isSamePos } from "./MoveUtils";
import { getPositionRelativeTo } from "./MoveUtils";

import { Board, INIT_SETUP_BOARD } from "../Board/Board";
import { HASH_SIDE_TO_MOVE_NUMBER } from "../Hashing/HashConstants";
import { FigureType } from "../Figure/FigureTypes";
import { ColorType } from "../Player/PlayerTypes";


function cloneGameState(gameState: GameState): GameState {
  const newGameState: GameState = {
    player: gameState.player.playerType === 'human' ? new HumanPlayer(gameState.player.getColor()) : new ComputerPlayer(gameState.player.getColor()),

    opponent: gameState.opponent.playerType === 'human' ? new HumanPlayer(gameState.opponent.getColor()) : new ComputerPlayer(gameState.opponent.getColor()),

    board: new Board(gameState.board.grid),

    moveHistory: new Array<HistoryEntry>(...gameState.moveHistory),

    checked: {
      whiteKingChecked: gameState.checked.whiteKingChecked,
      blackKingChecked: gameState.checked.blackKingChecked,
    },
    enPassantTargetFile: gameState.enPassantTargetFile,
    castlingRights: structuredClone(gameState.castlingRights),
    halfMoveClock: gameState.halfMoveClock,
    sideToMove: gameState.sideToMove,
    fullMoveCounter: gameState.fullMoveCounter,
  }

  if (gameState.hash !== undefined) {
    newGameState.hash = gameState.hash;
  }

  return newGameState;
}

function getDirection(gameState: GameState, piece: Figure): Direction {
  return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
}

function getPlayer(gameState: GameState, color: ColorType): Player {
  return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
}

function isRankEndOfBoard(gameState: GameState, rank: number, side: ColorType): boolean {
  return gameState.player.getColor() === side ? rank === 7 : rank === 0;
}

function canAttackSquare(gameState: GameState, attackerPos: Position, squareToAttack: Position, attackingOffset: Position): boolean {
  const board: Board = gameState.board;

  const piece: Figure | null = board.getPiece(attackerPos);

  if (!piece) return false;

  const piece2: Figure | null = board.getPiece(squareToAttack);

  if (!piece2) return false;

  if (areAllies(piece, piece2)) return false;

  const calculatedSquare: Position | null = getPositionRelativeTo(attackerPos, getDirection(gameState, piece), attackingOffset);

  if (!calculatedSquare || !isSamePos(calculatedSquare, squareToAttack)) return false;

  return true;
}

function areAllies(p1: Figure, p2: Figure): boolean {
  return p1.getColor() === p2.getColor();
}

/**
 * Checks if piece from *initPos* has ever moved from the start of the game.
 * @param gameState 
 * @param initPos 
 */
function containsInitialFigure(gameState: GameState, initPos: Position): boolean {
  const pieceOnBoard: Figure | null = gameState.board.getPiece(initPos);
  const pieceOnInitBoard: Figure | null = INIT_SETUP_BOARD.getPiece(initPos); 

  if (pieceOnBoard === pieceOnInitBoard && pieceOnBoard === null) {
    return true;
  }

  if (pieceOnBoard === null || pieceOnInitBoard === null) {
    return false;
  }

  return Figure.isSameFigure(pieceOnBoard, pieceOnInitBoard);
}

function nextSideToMove(gameState: GameState): ColorType {
  const moveHistory = gameState.moveHistory;
  if (moveHistory.length === 0) {
    return 'white';
  }

  const lastEntry: HistoryEntry = moveHistory[moveHistory.length - 1];

  return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
}

function isPieceOnEndOfBoard(gameState: GameState, pos: Position): boolean {
  const board: Board = gameState.board;
  const piece: Figure | null = board.getPiece(pos);

  if (!piece) {
    return false;
  }

  const dir: Direction = getDirection(gameState, piece);

  return getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) ? false : true;
}



function getPiecePosition(gameState: GameState, piece: Figure): Position | null {
  for (let y = 0; y <= 7; y++) {
    for (let x = 0; x <= 7; x++) {
      if (piece === gameState.board.grid[y][x]) {
        return { x: x, y: y };
      }
    }
  }
  return null;
}

function flipSideToMove(gameState: GameState): void {
  gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
  gameState.hash! ^= HASH_SIDE_TO_MOVE_NUMBER;
}

function getDestroyedPiece(gameState: GameState, attackerPiece: Figure, move: Move): Figure | null {
  const board: Board = gameState.board;
  if (!attackerPiece) return null;

  const player: Player = getPlayer(gameState, attackerPiece.getColor());

  const pieceToBeDestroyed: Figure | null = board.getPiece(move.end);

  if (!pieceToBeDestroyed) return null;

  if (areAllies(attackerPiece, pieceToBeDestroyed)) return null;

  return pieceToBeDestroyed;
}

export const CHAR_TO_FIGURE_MAP: Record<string, FigureType> = {
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
  p: 'pawn'
}


export { getDirection, getPlayer,  isRankEndOfBoard, canAttackSquare, areAllies, containsInitialFigure, nextSideToMove, isPieceOnEndOfBoard, getPiecePosition, flipSideToMove, getDestroyedPiece, cloneGameState };