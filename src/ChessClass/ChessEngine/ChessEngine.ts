import { Board } from "../Board/Board";
import { BISHOP_OFFSET_PATHS, KING_OFFSETS, KNIGHT_OFFSETS, QUEEN_OFFSET_PATHS, ROOK_OFFSET_PATHS } from "../constants";
import { Figure } from "../Figure/Figure";
import { INIT_SETUP_BOARD } from "../Board/Board";
import { inRange, positionInGrid, posToAlgNotation, parseAlgNotation, getUniqueArray, parseMove, getPieceNumber, getFilesEnPassantNumbers, getSideToMoveNumber, getCastlingRightsNumbers } from "../HelperFunctions";
import { findFigures, getEnPassantFile, getFigure, isFirstMove, isSameHistoryEntry, requestCastlingRights } from "../GameStateHelperFunctions";
import { isSameMove, isSamePos } from "../GameStateHelperFunctions";
import { ComputerPlayer, HumanPlayer, Player } from "../Player/Player";
import { ActionType, GameState, BaseMoveInfo, HistoryEntry, CastlingMoveInfo, CastlingRights, CastlingDetails, PromotionDetails, PlayerDetails } from "../types/ChessTypes";
import { ChessGrid } from "../Board/BoardTypes";
import { FigureType } from "../Figure/FigureTypes";
import { Direction, Move, Position } from "../Moves/MoveTypes";
import { ColorType, PlayerType } from "../Player/PlayerTypes";
import { cloneGameState, initGameStateHash } from "../GameStateHelperFunctions";
import { assert } from "console";
import NodeCache from "node-cache";
import { getMove, getMoveOffset, getPositionRelativeTo } from "../utils/MoveUtils";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { buildHistoryEntry, isHalfMove } from "../utils/historyUtils";
import { areAllies, canAttackSquare, flipSideToMove, getPiecePosition, getPlayer, isRankEndOfBoard, nextSideToMove } from "../utils/gameStateUtils";
import { getEnPassantPos } from "../Moves/MovesGenerator/FigureMovesGenerators/PawnMovesGenerator";
import { filterMoves } from "../Moves/LegalityChecks/LegalMoveValidation";
import { flushAllCaches, LEGAL_MOVES_CACHE } from "../Cache/Cache";


export class ChessEngine {

  static initGame(playerDetails: PlayerDetails, boardSetup?: ChessGrid | 'emptyBoard', sideToMove?: ColorType): GameState {
    const gameState: GameState = {
      player: playerDetails.player === 'human' ? new HumanPlayer('white') : new ComputerPlayer('white'),
      opponent: playerDetails.opponent === 'human' ? new HumanPlayer('black') : new ComputerPlayer('black'),
      board: new Board(),
      moveHistory: [],
      checked: {
        whiteKingChecked: false,
        blackKingChecked: false,
      },
      enPassantTargetFile: null,
      castlingRights: {
        white: {
          kingSide: true,
          queenSide: true,
        },
        black: {
          kingSide: true,
          queenSide: true,
        }
      },
      halfMoveClock: 0,
      sideToMove: sideToMove ?? 'white',
      fullMoveCounter: 1,
    };

    if (boardSetup && boardSetup !== 'emptyBoard') {
      gameState.board.grid = boardSetup;
    }
    if (!boardSetup) {
      this.setupBoard(gameState.board);
    }
    gameState.castlingRights = requestCastlingRights(gameState);

    initGameStateHash(gameState);

    flushAllCaches();

    return gameState;
  }

  

  static undoLastMove(gameState: GameState): boolean {
    const history: HistoryEntry[] = gameState.moveHistory;

    if (history.length === 0) return false;

    const nextNextSideToMove: ColorType = nextSideToMove(gameState);

    const lastEntry: HistoryEntry = history[history.length - 1];
    const preLastEntry: HistoryEntry | undefined = history.length >= 2 ? history[history.length - 2] : undefined;

    // popping last entry
    history.pop();

    // updating halfmove clock
    gameState.halfMoveClock = lastEntry.prevDetails.prevHalfMoveClock;

    const board: Board = gameState.board;

    // updating full move counter
    gameState.fullMoveCounter = lastEntry.prevDetails.prevFullMoveCounter;

    // piece on end/start numbers
    const pieceOnEnd: Figure = getFigure(gameState, lastEntry.move.end) as Figure;

    const pieceOnEndNumber: bigint = getPieceNumber(
      pieceOnEnd.getColor(),
      lastEntry.promotionDetails.isPromotion
        ? lastEntry.promotionDetails.promotedTo!
        : pieceOnEnd.getPiece(),
      lastEntry.move.end
    );

    const pieceOnStartNumber: bigint = getPieceNumber(
      pieceOnEnd.getColor(),
      lastEntry.promotionDetails.isPromotion
        ? 'pawn'
        : pieceOnEnd.getPiece(),
      lastEntry.move.start
    );

    if (lastEntry.promotionDetails.isPromotion) {
      lastEntry.piece.setPiece('pawn');
    }

    // restoring the hash
    switch (lastEntry.type) {
      case 'move': {
        gameState.hash! ^= pieceOnEndNumber;
        gameState.hash! ^= pieceOnStartNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });

        break;
      }
      case 'attackMove': {
        gameState.hash! ^= pieceOnEndNumber;
        gameState.hash! ^= pieceOnStartNumber;

        const destroyedPieceNumber: bigint = getPieceNumber(lastEntry.destroyedPiece!.getColor(), lastEntry.destroyedPiece!.getPiece(), lastEntry.move.end);

        gameState.hash! ^= destroyedPieceNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
        board.place(lastEntry.destroyedPiece!, lastEntry.move.end);
        break;
      }

      case 'enPassant': {
        gameState.hash! ^= pieceOnEndNumber;
        gameState.hash! ^= pieceOnStartNumber;

        const destroyedPieceNumber: bigint = getPieceNumber(lastEntry.destroyedPiece!.getColor(), lastEntry.destroyedPiece!.getPiece(), lastEntry.enPassantCapturedSquare!);

        gameState.hash! ^= destroyedPieceNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
        board.place(lastEntry.destroyedPiece!, lastEntry.enPassantCapturedSquare!);

        break;
      }

      case 'castling': {
        const castlingEntry: CastlingMoveInfo = lastEntry as CastlingMoveInfo;

        const kingOnEnd: Figure = getFigure(gameState, lastEntry.move.end) as Figure;

        const kingOnEndNumber: bigint = getPieceNumber(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.end);

        const kingOnStartNumber: bigint = getPieceNumber(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.start);

        gameState.hash! ^= kingOnEndNumber;
        gameState.hash! ^= kingOnStartNumber;

        const rookStartPosNumber: bigint = getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);

        const rookEndPosNumber: bigint = getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);

        gameState.hash! ^= rookEndPosNumber;
        gameState.hash! ^= rookStartPosNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
        board.move({ start: castlingEntry.rookMove.end, end: castlingEntry.rookMove.start });

        break;
      }

      default: {
        console.log(`Undo Move Case '${lastEntry.type}': Awaits implementation :)`);
      }
    }

    // restoring side to move
    flipSideToMove(gameState);

    // restoring en passant file

    if (gameState.enPassantTargetFile !== null) {
      gameState.hash! ^= getFilesEnPassantNumbers()[gameState.enPassantTargetFile];
      gameState.enPassantTargetFile = null;
    }

    const restoredEnPassantFile: number | null = getEnPassantFile(gameState);

    if (restoredEnPassantFile !== null) {
      gameState.hash! ^= getFilesEnPassantNumbers()[restoredEnPassantFile];
      gameState.enPassantTargetFile = restoredEnPassantFile;
    }
    const hashBefore: bigint = gameState.hash!;
    // restoring castling rights
    // firstly make all of the rights false
    let iter = 0;
    for (const color of ['white', 'black'] as ColorType[]) {
      for (const side of ['kingSide', 'queenSide'] as ('kingSide' | 'queenSide')[]) {
        if (gameState.castlingRights[color][side]) {
          gameState.hash! ^= getCastlingRightsNumbers()[iter];
        }
        iter++;
      }
    }

    gameState.castlingRights = requestCastlingRights(gameState);

    iter = 0;
    for (const color of ['white', 'black'] as ColorType[]) {
      for (const side of ['kingSide', 'queenSide'] as ('kingSide' | 'queenSide')[]) {
        if (gameState.castlingRights[color][side]) {
          gameState.hash! ^= getCastlingRightsNumbers()[iter];
        }
        iter++;
      }
    }



    return true;
  }


  /**
   * The function to initialize all chess pieces according to the chess rules
   * @param board 
   */
  static setupBoard(board: Board): void {
    const secondRow: FigureType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for (let x = 0; x <= 7; x++) {
      board.place(new Figure('white', 'pawn'), { x: x, y: 1 });
      board.place(new Figure('white', secondRow[x]), { x: x, y: 0 });

      board.place(new Figure('black', 'pawn'), { x: x, y: 6 });
      board.place(new Figure('black', secondRow[x]), { x: x, y: 7 });
    }


  }


  public static getLegalMoves(gameState: GameState, position: Position): HistoryEntry[] {
    if (!gameState.hash) initGameStateHash(gameState);

    const key: string = `${gameState.hash}:${position.x}${position.y}`;

    let legalMoves: HistoryEntry[] | undefined = LEGAL_MOVES_CACHE.get(key);

    if (legalMoves) {
      return legalMoves;
    }

    legalMoves = filterMoves(gameState, getMoves(gameState, position));

    LEGAL_MOVES_CACHE.set(key, legalMoves);

    return legalMoves;
  }

  /*
  public static promotePawn(gameState: GameState, pos: Position, pieceOfChoice: Exclude<FigureType, 'king' | 'pawn'>): boolean {
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece || piece.getPiece() !== 'pawn') {
      return false;
    }

    if (!this.isPieceOnEndOfBoard(gameState, pos)) {
      return false;
    }

    piece.setPiece(pieceOfChoice);

    const emptyMove: Move = {
      start: pos,
      end: pos,
    }

    const entry: HistoryEntry | null = buildHistoryEntry(gameState, emptyMove, null, 'promotion'); 

    if (!entry) {
      return false;
    } 

    gameState.moveHistory.push(entry);

    // updating the hash
    const pawnNumber: bigint = getPieceNumber(piece.getColor(), 'pawn', pos);
    const resultPieceNumber: bigint = getPieceNumber(piece.getColor(), piece.getPiece(), pos);

    gameState.hash! ^= pawnNumber;
    gameState.hash! ^= resultPieceNumber;

    return true;
  }
    */

  

  /**
   * Helper Methods
   */

  public static applyMove(gameState: GameState, entry: HistoryEntry): void {
    gameState.board.move(entry.move);

    const p: Figure = getFigure(gameState, entry.move.end) as Figure;

    gameState.moveHistory.push(entry);

    const move: Move = entry.move;

    if (entry.player.getColor() === 'black') {
      gameState.fullMoveCounter++;
    }

    if (entry.destroyedPiece) {
      const destroyedPiecePos: Position | null = getPiecePosition(gameState, entry.destroyedPiece);

      if (destroyedPiecePos) {
        gameState.board.removePiece(destroyedPiecePos);
      }
    }

    if (entry.promotionDetails.isPromotion) {
      entry.piece.setPiece(entry.promotionDetails.promotedTo!);
      //console.log(gameState.moveHistory);
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
    gameState.enPassantTargetFile = getEnPassantFile(gameState);

    if (gameState.enPassantTargetFile !== null) {
      gameState.hash! ^= enPassantNumbers[gameState.enPassantTargetFile]
    }

    // hash for side to move
    flipSideToMove(gameState);

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
        gameState.hash! ^= getPieceNumber(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);

        // xor in new position
        gameState.hash! ^= getPieceNumber(color, pieceType, move.end);
        break;
      }

      case 'enPassant':
      case 'attackMove': {
        // xor out init pos 
        gameState.hash! ^= getPieceNumber(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);


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
    if (isHalfMove(entry)) {
      gameState.halfMoveClock++;
    } else {
      gameState.halfMoveClock = 0;
    }
    flushAllCaches();

  }

  
}
