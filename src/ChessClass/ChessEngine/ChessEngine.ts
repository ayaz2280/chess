import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";

import { ComputerPlayer, HumanPlayer } from "../Player/Player";
import { GameState, HistoryEntry, CastlingMoveInfo, PlayerDetails } from "../types/ChessTypes";
import { ChessGrid } from "../Board/BoardTypes";
import { FigureType } from "../Figure/FigureTypes";
import { Move, Position } from "../Moves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";

import { assert } from "console";
import { getMoves } from "../Moves/MovesGenerator/MovesGenerator";
import { isHalfMove } from "../utils/historyUtils";
import { flipSideToMove, getPiecePosition, nextSideToMove } from "../utils/gameStateUtils";
import { filterMoves } from "../Moves/LegalityChecks/LegalMoveValidation";
import { flushAllCaches, LEGAL_MOVES_CACHE } from "../Cache/Cache";
import { getPieceNumber, HASH_CASTLING_RIGHTS_NUMBERS, HASH_EN_PASSANT_FILES_NUMBERS } from "../Hashing/HashConstants";
import { initGameStateHash } from "../Hashing/HashFunctions";
import { requestCastlingRights, getEnPassantFile } from "../utils/evalGameStateUtils";
import { moveToAlgNotation, parseAlgNotation, parseMove, posToAlgNotation } from "../Moves/AlgNotation/AlgNotation";
import { saveGameStateToJson } from "../utils/jsonUtils";
import { isSameMove } from "../utils/MoveUtils";
import { updateChecks } from "../Moves/LegalityChecks/KingChecks";


export class ChessEngine {
  static applyHits: number = 0;
  static undoHits: number = 0;
  static initGame(playerDetails: PlayerDetails, boardSetup?: ChessGrid | 'emptyBoard', sideToMove?: ColorType): GameState {
    const gameState: GameState = {
      player: playerDetails.player === 'human' ? new HumanPlayer('white') : new ComputerPlayer('white'),
      opponent: playerDetails.opponent === 'human' ? new HumanPlayer('black') : new ComputerPlayer('black'),
      board: new Board(),
      moveHistory: [],
      checked: {
        whiteKingChecked: {checkingPieces: []},
        blackKingChecked: {checkingPieces: []},
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
      hash: 0n,
    };

    if (boardSetup && boardSetup !== 'emptyBoard') {
      gameState.board.grid = boardSetup;
    }
    if (!boardSetup) {
      this.setupBoard(gameState.board);
    }
    gameState.castlingRights = requestCastlingRights(gameState);

    initGameStateHash(gameState);

    updateChecks(gameState);

    flushAllCaches();

    return gameState;
  }

  
  // 3069 HIT
  static undoLastMove(gameState: GameState): boolean {
    const history: HistoryEntry[] = gameState.moveHistory;
    this.undoHits++;

    if (history.length === 0) return false;

    // DEBUG
    const BLACK_PAWN_A5: Figure | null = gameState.board.getPiece(parseAlgNotation('a5'));
    if (this.applyHits >= 3048 && BLACK_PAWN_A5 === null) {
      // console.log(this.undoHits + ' undo');
    }
    //

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
    const pieceOnEnd: Figure | null = board.getPiece(lastEntry.move.end);

    
    if (!pieceOnEnd) {
      // console.log(ChessEngine.applyHits);
      board.display();
      console.log(lastEntry);
      saveGameStateToJson(gameState);
      throw new Error(`Couldn't find a piece on square ${posToAlgNotation(lastEntry.move.end)} (x: ${lastEntry.move.end.x}, y: ${lastEntry.move.end.y})`)
    }
      

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
        gameState.hash ^= pieceOnEndNumber;
        gameState.hash ^= pieceOnStartNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });

        break;
      }
      case 'attackMove': {
        gameState.hash ^= pieceOnEndNumber;
        gameState.hash ^= pieceOnStartNumber;

        const destroyedPieceNumber: bigint = getPieceNumber(lastEntry.destroyedPiece!.getColor(), lastEntry.destroyedPiece!.getPiece(), lastEntry.move.end);

        gameState.hash ^= destroyedPieceNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
        board.place(lastEntry.destroyedPiece!, lastEntry.move.end);
        break;
      }

      case 'enPassant': {
        gameState.hash ^= pieceOnEndNumber;
        gameState.hash ^= pieceOnStartNumber;

        const destroyedPieceNumber: bigint = getPieceNumber(lastEntry.destroyedPiece!.getColor(), lastEntry.destroyedPiece!.getPiece(), lastEntry.enPassantCapturedSquare!);

        gameState.hash ^= destroyedPieceNumber;

        board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
        board.place(lastEntry.destroyedPiece!, lastEntry.enPassantCapturedSquare!);

        break;
      }

      case 'castling': {
        const castlingEntry: CastlingMoveInfo = lastEntry as CastlingMoveInfo;

        const kingOnEnd: Figure = board.getPiece(lastEntry.move.end) as Figure;

        const kingOnEndNumber: bigint = getPieceNumber(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.end);

        const kingOnStartNumber: bigint = getPieceNumber(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.start);

        gameState.hash ^= kingOnEndNumber;
        gameState.hash ^= kingOnStartNumber;

        const rookStartPosNumber: bigint = getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);

        const rookEndPosNumber: bigint = getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);

        gameState.hash ^= rookEndPosNumber;
        gameState.hash ^= rookStartPosNumber;

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
      gameState.hash ^= HASH_EN_PASSANT_FILES_NUMBERS[gameState.enPassantTargetFile];
      gameState.enPassantTargetFile = null;
    }

    const restoredEnPassantFile: number | null = getEnPassantFile(gameState);

    if (restoredEnPassantFile !== null) {
      gameState.hash ^= HASH_EN_PASSANT_FILES_NUMBERS[restoredEnPassantFile];
      gameState.enPassantTargetFile = restoredEnPassantFile;
    }
    const hashBefore: bigint = gameState.hash;
    // restoring castling rights
    // firstly make all of the rights false
    let iter = 0;
    for (const color of ['white', 'black'] as ColorType[]) {
      for (const side of ['kingSide', 'queenSide'] as ('kingSide' | 'queenSide')[]) {
        if (gameState.castlingRights[color][side]) {
          gameState.hash ^= HASH_CASTLING_RIGHTS_NUMBERS[iter];
        }
        iter++;
      }
    }

    gameState.castlingRights = requestCastlingRights(gameState);

    iter = 0;
    for (const color of ['white', 'black'] as ColorType[]) {
      for (const side of ['kingSide', 'queenSide'] as ('kingSide' | 'queenSide')[]) {
        if (gameState.castlingRights[color][side]) {
          gameState.hash ^= HASH_CASTLING_RIGHTS_NUMBERS[iter];
        }
        iter++;
      }
    }

    // restoring kings checked
    gameState.checked = lastEntry.prevDetails.prevChecked;

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

    gameState.hash ^= pawnNumber;
    gameState.hash ^= resultPieceNumber;

    return true;
  }
    */

  

  /**
   * Helper Methods
   */
  // 3048 HITS
  public static applyMove(gameState: GameState, entry: HistoryEntry): void {
    gameState.board.move(entry.move);
    const board: Board = gameState.board;

    // DEBUG
    /*
    ChessEngine.applyHits++;
    if (isSameMove(entry.move, parseMove('b4-a5'))) {
      // console.log(`${this.applyHits} apply`);
    }
      */
    //

    const p: Figure = board.getPiece(entry.move.end) as Figure;

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

    // updating hash

    // updating en passant target file
    // xor out prev if present
    const enPassantPrevFile: number | null = gameState.enPassantTargetFile;

    if (enPassantPrevFile !== null) {
      gameState.hash ^= HASH_EN_PASSANT_FILES_NUMBERS[enPassantPrevFile];
    }


    // xor in new file if present
    gameState.enPassantTargetFile = getEnPassantFile(gameState);

    if (gameState.enPassantTargetFile !== null) {
      gameState.hash ^= HASH_EN_PASSANT_FILES_NUMBERS[gameState.enPassantTargetFile]
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

        gameState.hash ^= HASH_CASTLING_RIGHTS_NUMBERS[castlingRightNumber];

        // xor out init rook pos
        gameState.hash ^= getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);

        // xor in new position
        gameState.hash ^= getPieceNumber(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);

        // placing a rook into a new position
        gameState.board.move(castlingEntry.rookMove);
      }
      case 'move': {
        // xor out init pos
        gameState.hash ^= getPieceNumber(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);

        // xor in new position
        gameState.hash ^= getPieceNumber(color, pieceType, move.end);
        break;
      }

      case 'enPassant':
      case 'attackMove': {
        // xor out init pos 
        gameState.hash ^= getPieceNumber(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);


        // xor out piece on end pos
        if (entry.destroyedPiece) {
          const destroyedPiecePos: Position = entry.type === 'attackMove' ? move.end : entry.enPassantCapturedSquare!;

          gameState.hash ^= getPieceNumber(
            entry.destroyedPiece.getColor(),
            entry.destroyedPiece.getPiece(),
            destroyedPiecePos,
          );
        }

        // xor in new position
        gameState.hash ^= getPieceNumber(color, pieceType, move.end);
        break;
      }
    }

    // update halfmove clock counter
    if (isHalfMove(entry)) {
      gameState.halfMoveClock++;
    } else {
      gameState.halfMoveClock = 0;
    }
    updateChecks(gameState);

    flushAllCaches();

  }

  
}
