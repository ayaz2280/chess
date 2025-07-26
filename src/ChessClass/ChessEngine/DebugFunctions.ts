import { assert } from "chai";
import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { initGameStateHash, isSameMove } from "../GameStateHelperFunctions";
import { getPieceNumber } from "../HelperFunctions";
import { Move, Position } from "../Moves/MoveTypes";
import { GameState, HistoryEntry } from "../types/ChessTypes";
import { ChessEngine } from "./ChessEngine";

function placeFigure(gameState: GameState, pos: Position, figure: Figure): boolean {
  const board: Board = gameState.board;

  let removedPiece: Figure | null = null;

  try {
    removedPiece = board.place(figure, pos);
  } catch (err: any) {
    assert(err instanceof Error);
    console.error(err);
    return false;
  }

  if (gameState.hash === undefined) {
    initGameStateHash(gameState);
  } else {
    if (removedPiece) {
      gameState.hash ^= getPieceNumber(removedPiece.getColor(), removedPiece.getPiece(), pos);
    }
    gameState.hash ^= getPieceNumber(figure.getColor(), figure.getPiece(), pos);
  }

  return true;
}

function removeFigure(gameState: GameState, pos: Position): boolean {
  const board: Board = gameState.board;
  const removedPiece: Figure | null = board.removePiece(pos);

  if (!removedPiece) return false;

  if (gameState.hash === undefined) {
    initGameStateHash(gameState);
  } else {
    gameState.hash ^= getPieceNumber(removedPiece.getColor(), removedPiece.getPiece(), pos);
  }

  return true;
}

/**
   * apply function for debugging purposes only
   * Applies a move to a chess board. If move is legible, returns true. Otherwise, returns false.
   * @param gameState 
   * @param move 
   * @returns 
   */
  function applyMoveDebug(gameState: GameState, move: Move): boolean {
    const entry: HistoryEntry | undefined = ChessEngine.getLegalMoves(gameState, move.start).find(e => isSameMove(e.move, move));

    if (!entry) return false;

    ChessEngine.applyMove(gameState, entry);

    return true;
    /*
    const entry: HistoryEntry | null = this.validateMove(gameState, move);


    if (!entry) return false;

    gameState.board.move(entry.move);

    gameState.moveHistory.push(entry);
    
    if (entry.destroyedPiece) {
      const destroyedPiecePos: Position | null = this.getPiecePosition(gameState, entry.destroyedPiece); 
      
      if (destroyedPiecePos) {
        gameState.board.removePiece(destroyedPiecePos);
      }
    }

    assert(gameState.hash !== undefined);

    // updating hash

    // updating en passant target file
    // xor out prev if present
    const enPassantPrevFile: number | null = gameState.enPassantTargetFile;

    const enPassantNumbers: bigint[] = getFilesEnPassantNumbers();
    if (enPassantPrevFile !== null) {
      gameState.hash! ^= enPassantNumbers[enPassantPrevFile];
    }


    // xor in new file if present
    gameState.enPassantTargetFile = this.getEnPassantFile(gameState);

    if (gameState.enPassantTargetFile !== null) {
      gameState.hash! ^= enPassantNumbers[gameState.enPassantTargetFile]
    }

    // hash for side to move
    const nextSideToMove: ColorType = this.nextSideToMove(gameState);
    if (nextSideToMove !== entry.player.getColor()) {
      gameState.hash! ^= getSideToMoveNumber();
    }

    const [color, pieceType] = [entry.piece.getColor(), entry.piece.getPiece()];
    
    switch (entry.type) {
      case 'castling': {
        const castlingEntry: CastlingMoveInfo = entry as CastlingMoveInfo;

        // update castling rights in gamestate
        const castlingColor: ColorType = castlingEntry.castlingDetails.at(0) === 'w' ? 'white' : 'black';
        const castlingSide: 'kingSide' | 'queenSide' = castlingEntry.castlingDetails.at(1) === 'k' ? 'kingSide' : 'queenSide';

        gameState.castlingRights[castlingColor][castlingSide] = false;

        let castlingRightNumber: number = castlingSide === 'queenSide' ? 1 : 0;
        castlingRightNumber += castlingColor === 'black' ? 2 : 0;

        gameState.hash! ^= getCastlingRightsNumbers()[castlingRightNumber];

        // xor out init rook pos
        gameState.hash! ^= getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);

        // xor in new position
        gameState.hash! ^= getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);

        // placing a rook into a new position
        gameState.board.move(castlingEntry.rookMove);
      }
      case 'move': {
        // xor out init pos
        gameState.hash! ^= getPieceNumber(color, pieceType, move.start);

        // xor in new position
        gameState.hash! ^= getPieceNumber(color, pieceType, move.end);
        break;
      }

      case 'enPassant':
      case 'attackMove': {
        // xor out init pos 
        gameState.hash! ^= getPieceNumber(color, pieceType, move.start);

        // xor out piece on end pos
        if (entry.destroyedPiece) {
          const destroyedPiecePos: Position = entry.type === 'attackMove' ? move.end : entry.enPassantCapturedSquare!;

          gameState.hash! ^= getPieceNumber(
            entry.destroyedPiece.getColor(),
            entry.destroyedPiece.getPiece(),
            destroyedPiecePos,
          );
        }

        // xor in new position
        gameState.hash! ^= getPieceNumber(color, pieceType, move.end);
        break;
      }
    }

    // update halfmove clock counter
    if (this.isHalfMove(entry)) {
      gameState.halfMoveClock++;
    } else {
      gameState.halfMoveClock = 0;
    }
    this.flushAllCaches();

    return true;
    */
  }

  /**
   * The same as *applyMoveDebug*, but throws the error on illegible move
   * @param gameState
   * @param move 
   */
  function move(gameState: GameState, move: Move) {
    if (!applyMoveDebug(gameState, move))
      throw new Error(`Move ${move} is illegible`);
  }

export { placeFigure, removeFigure, applyMoveDebug, move };