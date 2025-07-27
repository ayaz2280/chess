import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";


import { Position } from "../Moves/MoveTypes";
import { GameState, CastlingRights } from "../types/ChessTypes";
import { requestCastlingRights, getEnPassantFile } from "../utils/evalGameStateUtils";

import { getPieceNumber, HASH_CASTLING_RIGHTS_NUMBERS, HASH_EN_PASSANT_FILES_NUMBERS, HASH_SIDE_TO_MOVE_NUMBER, PSEUDO_RANDOM_NUMBERS } from "./HashConstants";

function initGameStateHash(gameState: GameState, enPassantFile?: number | null): bigint {
  if (gameState.hash) {
    return gameState.hash;
  }
  gameState.hash = 0n;

  const board: Board = gameState.board;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const pos: Position = { x: x, y: y };
      const piece: Figure | null = board.getPiece(pos);

      if (!piece) continue;

      gameState.hash ^= getPieceNumber(piece.getColor(), piece.getPiece(), pos);
    }
  }

  // the side to move is black
  if (gameState.sideToMove === 'black') {
    gameState.hash ^= HASH_SIDE_TO_MOVE_NUMBER;
  }

  const castlingRights: CastlingRights = requestCastlingRights(gameState);
  const castlingRightsArr: boolean[] = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];

  castlingRightsArr.forEach((castlingRight, id) => {
    if (castlingRight) {
      gameState.hash! ^= HASH_CASTLING_RIGHTS_NUMBERS[id];
    }
  });

  const enPassantTargetFile: number | null = enPassantFile ?? getEnPassantFile(gameState);

  if (enPassantTargetFile) {
    gameState.hash ^= HASH_EN_PASSANT_FILES_NUMBERS[enPassantTargetFile];
  }

  return gameState.hash;
}

function calculateHash(gameState: GameState): bigint {
  let hash: bigint = 0n;

  const board: Board = gameState.board;

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const pos: Position = { x: x, y: y };
      const piece: Figure | null = board.getPiece(pos);

      if (!piece) continue;

      hash ^= getPieceNumber(piece.getColor(), piece.getPiece(), pos);
    }
  }

  // the side to move is black
  if (gameState.moveHistory.length !== 0 && gameState.moveHistory[gameState.moveHistory.length - 1].player.getColor() === 'white') {
    hash ^= HASH_SIDE_TO_MOVE_NUMBER;
  }

  const castlingRights: CastlingRights = requestCastlingRights(gameState);
  const castlingRightsArr: boolean[] = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];

  castlingRightsArr.forEach((castlingRight, id) => {
    if (castlingRight) {
      hash ^= HASH_CASTLING_RIGHTS_NUMBERS[id];
    }
  });

  const enPassantFile: number | null = getEnPassantFile(gameState);

  if (enPassantFile) {
    hash ^= HASH_EN_PASSANT_FILES_NUMBERS[enPassantFile];
  }

  return hash;
}

/*
function recalculateHash(gameState: GameState, newEntry: HistoryEntry): bigint {
  if (!gameState.hash) {
    gameState.hash = initGameStateHash(gameState);
  }

  const move: Move = newEntry.move;
  const board: Board = gameState.board;

  const pieceOnStart: Figure | null = board.getPiece(move.start);

  if (pieceOnStart === null) {
    throw new Error(`Error Hashing: no figure on start pos { x: ${move.start}, y: ${move.end.y}}`);
  }

  const movingPieceNum: bigint = getPieceNumber(pieceOnStart.getColor(), pieceOnStart.getPiece(), move.start);


  return gameState.hash;
}
  */

export { initGameStateHash, calculateHash };