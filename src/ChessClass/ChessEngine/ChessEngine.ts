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
import { getMoveOffset, getPositionRelativeTo } from "../Moves/MoveUtils";


export class ChessEngine {
  static legalMovesCache = new NodeCache({ useClones: false });
  static pseudoLegalMovesCache = new NodeCache({ useClones: false });

  static flushAllCaches(): void {
    this.legalMovesCache.flushAll();
    this.pseudoLegalMovesCache.flushAll();
  }

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

    this.flushAllCaches();

    return gameState;
  }

  static isHalfMove(entry: HistoryEntry): boolean {
    if (entry.type === 'attackMove' || entry.type === 'checkmate' || entry.type === 'enPassant') {
      return false;
    }

    if (entry.piece.getPiece() === 'pawn') {
      return false;
    }
    return true;
  }

  static undoLastMove(gameState: GameState): boolean {
    const history: HistoryEntry[] = gameState.moveHistory;

    if (history.length === 0) return false;

    const nextNextSideToMove: ColorType = this.nextSideToMove(gameState);

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
    this.flipSideToMove(gameState);

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

  /**
   * Returns array of all possible moves for selected piece
   * @param gameState
   * @param position a position of a piece to  obtain legal moves from
   */

  public static getMoves(gameState: GameState, position: Position, types?: ActionType[]): HistoryEntry[] {
    const uniqueTypes: ActionType[] | undefined = types ? getUniqueArray(types) : undefined;

    let pseudoLegalMoves: HistoryEntry[] | undefined = [];

    if (!gameState.board.grid[position.y][position.x]) return pseudoLegalMoves;

    if (!gameState.hash) initGameStateHash(gameState);

    const typesKey: string = uniqueTypes ? uniqueTypes.join('_') : 'all';

    const key: string = `${gameState.hash}:${position.x}${position.y}:${typesKey}`;

    pseudoLegalMoves = this.pseudoLegalMovesCache.get(key);

    if (pseudoLegalMoves) {
      return pseudoLegalMoves;
    }
    pseudoLegalMoves = [];

    const piece: Figure = gameState.board.grid[position.y][position.x] as Figure;

    const pieceType: FigureType = piece.getPiece();


    switch (pieceType) {
      case 'pawn': {
        pseudoLegalMoves.push(...this.getPawnMoves(gameState, position, uniqueTypes));
        break;
      }
      case 'knight': {
        pseudoLegalMoves.push(...this.getKnightMoves(gameState, position, uniqueTypes));
        break;
      }
      case 'rook': {
        pseudoLegalMoves.push(...this.getRookMoves(gameState, position, uniqueTypes));
        break;
      }
      case 'bishop': {
        pseudoLegalMoves.push(...this.getBishopMoves(gameState, position, uniqueTypes));
        break;
      }
      case 'queen': {
        pseudoLegalMoves.push(...this.getQueenMoves(gameState, position, uniqueTypes));
        break;
      }
      case 'king': {
        pseudoLegalMoves.push(...this.getKingMoves(gameState, position, uniqueTypes));
        break;
      }
    }

    this.pseudoLegalMovesCache.set(key, pseudoLegalMoves);

    return pseudoLegalMoves;
  }

  public static getLegalMoves(gameState: GameState, position: Position): HistoryEntry[] {
    if (!gameState.hash) initGameStateHash(gameState);

    const key: string = `${gameState.hash}:${position.x}${position.y}`;

    let legalMoves: HistoryEntry[] | undefined = this.legalMovesCache.get(key);

    if (legalMoves) {
      return legalMoves;
    }

    legalMoves = this.filterMoves(gameState, this.getMoves(gameState, position));

    this.legalMovesCache.set(key, legalMoves);

    return legalMoves;
  }

  private static getPawnMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const board: Board = gameState.board;
    const piece: Figure | null = board.grid[pos.y][pos.x];
    let entry: HistoryEntry | null;
    let move: Move;

    if (!piece || !(piece.getPiece() === 'pawn')) return [];

    const moves: HistoryEntry[] = [];

    const dir: Direction = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';

    let isPromotionMove: boolean = false;

    // moves of type 'move'
    if (
      !types ||
      types.includes('move')
    ) {
      if (isFirstMove(gameState, pos)) {
        const offset: Position = {
          x: 0,
          y: 2,
        }
        const twoSquareAhead: Position = getPositionRelativeTo(pos, dir, offset) as Position;

        const oneSquareAhead: Position = getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) as Position;

        if (
          twoSquareAhead &&
          !this.isOccupied(gameState, twoSquareAhead) &&
          !this.isOccupied(gameState, oneSquareAhead)
        ) {
          move = this.getMove(pos, twoSquareAhead);
          entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

          if (entry) {
            moves.push(entry);
          }
        }
      }

      // check for 1 square move
      const oneSquareAhead: Position | null = getPositionRelativeTo(pos, dir, {
        x: 0,
        y: 1,
      });

      if (oneSquareAhead) {
        const moveOneSquare: Move = {
          start: pos,
          end: oneSquareAhead,
        };
        if (!this.isOccupied(gameState, oneSquareAhead)) {
          move = this.getMove(pos, oneSquareAhead);

          if (this.isRankEndOfBoard(gameState, oneSquareAhead.y, piece.getColor())) {
            const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

            figureTypes.forEach((figType) => {
              entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });

              if (entry) {
                moves.push(entry);
              }
            });
          } else {
            entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

            if (entry) {
              moves.push(entry);
            }
          }
        }
      }
    }

    // moves of type 'attackMove'
    if (
      !types ||
      types.includes('attackMove')
    ) {
      // check for diagonal attacking moves
      const leftDiagonalOffset: Position = {
        x: -1,
        y: 1,
      };

      const rightDiagonalOffset: Position = {
        x: 1,
        y: 1,
      };

      const leftDiagonal: Position | null = getPositionRelativeTo(pos, dir, leftDiagonalOffset);

      const rightDiagonal: Position | null = getPositionRelativeTo(pos, dir, rightDiagonalOffset);

      if (leftDiagonal) {
        if (this.canAttackSquare(gameState, pos, leftDiagonal, leftDiagonalOffset)) {
          move = this.getMove(pos, leftDiagonal);

          if (this.isRankEndOfBoard(gameState, leftDiagonal.y, piece.getColor())) {
            const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

            figureTypes.forEach((figType) => {
              entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });

              if (entry) {
                moves.push(entry);
              }
            });
          } else {
            entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });

            if (entry) {
              moves.push(entry);
            }
          }
        }
      }

      if (rightDiagonal) {
        if (this.canAttackSquare(gameState, pos, rightDiagonal, rightDiagonalOffset)) {
          move = this.getMove(pos, rightDiagonal);
          const destroyedPiece: Figure = getFigure(gameState, move.end) as Figure;

          if (this.isRankEndOfBoard(gameState, rightDiagonal.y, piece.getColor())) {
            const figureTypes: (Exclude<FigureType, 'king' | 'pawn'>)[] = ['bishop', 'knight', 'queen', 'rook'];

            figureTypes.forEach((figType) => {
              entry = this.buildHistoryEntry(gameState, move, destroyedPiece, 'attackMove', { isPromotion: true, promotedTo: figType });

              if (entry) {
                moves.push(entry);
              }
            });
          } else {
            entry = this.buildHistoryEntry(gameState, move, destroyedPiece, 'attackMove', { isPromotion: false });

            if (entry) {
              moves.push(entry);
            }
          }
        }
      }

    }

    // moves of type en passant
    if (!types || types.includes('enPassant')) {
      const enPassantPos: Position | null = this.getEnPassantPos(gameState, pos);

      if (enPassantPos) {
        move = this.getMove(pos, enPassantPos);
        entry = this.buildHistoryEntry(gameState, move, getFigure(gameState, getPositionRelativeTo(enPassantPos, dir, { x: 0, y: -1 }) as Position), 'enPassant', { isPromotion: false });

        if (entry) {
          moves.push(entry);
        }
      }
    }

    return moves;
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

    const entry: HistoryEntry | null = this.buildHistoryEntry(gameState, emptyMove, null, 'promotion'); 

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

  private static getKnightMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const moves: HistoryEntry[] = [];
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) return moves;

    const pseudoLegalKnightPositions: Position[] = KNIGHT_OFFSETS
      .map(a => { return { ...a } })
      .filter(offset => {
        const end: Position | null = getPositionRelativeTo(pos, 'forward', offset);

        if (!end) {
          return false;
        }

        const move: Move = this.getMove(pos, end);

        const pieceOnSquare: Figure | null = getFigure(gameState, end);

        if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) {
          return false;
        }

        return true;

      })
      .map(offset => {
        return getPositionRelativeTo(pos, 'forward', offset) as Position;
      })

    for (const endPos of pseudoLegalKnightPositions) {
      const destroyedPiece: Figure | null = getFigure(gameState, endPos);

      if (!destroyedPiece && (!types || types.includes('move'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
        );
      }

      if (destroyedPiece && (!types || types.includes('attackMove'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
        );
      }
    }

    return moves;
  }

  private static getRookMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const moves: HistoryEntry[] = [];
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) return moves;


    const pseudoLegalRookPositions: Position[] =
      ROOK_OFFSET_PATHS
        .flatMap(offsetPath => {
          const legitPositions: Position[] = [];
          for (const offset of offsetPath) {
            const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);
            if (!resPos) break;

            const pieceOnSquare: Figure | null = getFigure(gameState, resPos);

            if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) {
              break;
            }

            legitPositions.push(resPos);
            if (pieceOnSquare) {
              break;
            }
          }
          return legitPositions;
        });

    for (const endPos of pseudoLegalRookPositions) {
      const destroyedPiece: Figure | null = getFigure(gameState, endPos);

      if (!destroyedPiece && (!types || types.includes('move'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
        );
      }

      if (destroyedPiece && (!types || types.includes('attackMove'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
        );
      }
    }

    return moves;
  }

  private static getBishopMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const moves: HistoryEntry[] = [];
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) return moves;

    const pseudoLegalBishopPositions: Position[] =
      BISHOP_OFFSET_PATHS
        .flatMap(offsetPath => {
          const legitPositions: Position[] = [];
          for (const offset of offsetPath) {
            const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);
            if (!resPos) break;

            const pieceOnSquare: Figure | null = getFigure(gameState, resPos);

            if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) {
              break;
            }

            legitPositions.push(resPos);
            if (pieceOnSquare) {
              break;
            }
          }
          return legitPositions;
        });

    for (const endPos of pseudoLegalBishopPositions) {
      const destroyedPiece: Figure | null = getFigure(gameState, endPos);

      if (!destroyedPiece && (!types || types.includes('move'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
        );
      }

      if (destroyedPiece && (!types || types.includes('attackMove'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
        );
      }
    }

    return moves;
  }

  private static getQueenMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const moves: HistoryEntry[] = [];
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) return moves;

    const pseudoLegalQueenPositions: Position[] =
      QUEEN_OFFSET_PATHS
        .flatMap(offsetPath => {
          const legitPositions: Position[] = [];
          for (const offset of offsetPath) {
            const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);
            if (!resPos) break;

            const pieceOnSquare: Figure | null = getFigure(gameState, resPos);

            if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) {
              break;
            }

            legitPositions.push(resPos);
            if (pieceOnSquare) {
              break;
            }
          }
          return legitPositions;
        });

    for (const endPos of pseudoLegalQueenPositions) {
      const destroyedPiece: Figure | null = getFigure(gameState, endPos);

      if (!destroyedPiece && (!types || types.includes('move'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
        );
      }

      if (destroyedPiece && (!types || types.includes('attackMove'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
        );
      }
    }

    return moves;
  }

  private static getKingMoves(gameState: GameState, pos: Position, types?: ActionType[]): HistoryEntry[] {
    const moves: HistoryEntry[] = [];
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) return moves;

    const pseudoLegalKingPositions: Position[] =
      KING_OFFSETS
        .flatMap(offset => {
          const resPos: Position | null = getPositionRelativeTo(pos, 'forward', offset);

          if (!resPos) return [];

          const pieceOnSquare: Figure | null = getFigure(gameState, resPos);

          if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) return [];

          return [resPos];
        });

    for (const endPos of pseudoLegalKingPositions) {
      const destroyedPiece: Figure | null = getFigure(gameState, endPos);

      if (!destroyedPiece && (!types || types.includes('move'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }) as HistoryEntry
        );
      }

      if (destroyedPiece && (!types || types.includes('attackMove'))) {
        moves.push(
          this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }) as HistoryEntry
        );
      }
    }

    if (!types || types.includes('castling')) {
      moves.push(...this.getCastlingMoves(gameState, pos));
    }

    return moves;
  }

  private static getCastlingMoves(gameState: GameState, kingPos: Position): HistoryEntry[] {
    const moves: CastlingMoveInfo[] = [];

    const piece: Figure | null = getFigure(gameState, kingPos);

    if (!piece || piece.getPiece() !== 'king') {
      return moves;
    }

    if (!isFirstMove(gameState, kingPos) || this.isKingChecked(gameState, piece.getColor())) {
      return moves;
    }

    // Checking if rooks are on their places
    const dir: Direction = this.getDirection(gameState, piece);

    const [leftRookInitPos, rightRookInitPos] = [
      getPositionRelativeTo(kingPos, 'forward', { x: -4, y: 0 }) as Position,
      getPositionRelativeTo(kingPos, 'forward', { x: 3, y: 0 }) as Position,
    ]

    const [leftRookOnPlace, rightRookOnPlace] = [this.containsInitialFigure(gameState, leftRookInitPos), this.containsInitialFigure(gameState, rightRookInitPos)];

    // Checking the path

    let castlingPossible: boolean = true;
    if (leftRookOnPlace) {
      for (let i = 1; i <= 3; i++) {
        const posOnPath: Position = getPositionRelativeTo(kingPos, 'forward', { x: -1 * i, y: 0 }) as Position;

        if (this.isOccupied(gameState, posOnPath)) {
          castlingPossible = false;
          break;
        }
      }

      if (castlingPossible) {
        const move: Move = this.getMove(kingPos, getPositionRelativeTo(kingPos, 'forward', { x: -2, y: 0 }) as Position);
        moves.push(
          this.buildHistoryEntry(
            gameState,
            move,
            null,
            'castling', { isPromotion: false }) as CastlingMoveInfo
        );
      }
    }

    castlingPossible = true;
    if (rightRookOnPlace) {
      for (let i = 1; i <= 2; i++) {
        const posOnPath: Position = getPositionRelativeTo(kingPos, 'forward', { x: i, y: 0 }) as Position;

        if (this.isOccupied(gameState, posOnPath)) {
          castlingPossible = false;
          break;
        }
      }

      if (castlingPossible) {
        const move: Move = this.getMove(kingPos, getPositionRelativeTo(kingPos, 'forward', { x: 2, y: 0 }) as Position);
        moves.push(
          this.buildHistoryEntry(
            gameState,
            move,
            null,
            'castling', { isPromotion: false }) as CastlingMoveInfo
        );
      }
    }


    return moves;
  }

  private static filterMoves(gameState: GameState, entries: HistoryEntry[]) {
    return entries.filter(entry => this.validateMove(gameState, entry.move) ? true : false);
  }

  /**
   * Helper Methods
   */

  /**
   * Checks if piece from *initPos* has ever moved from the start of the game.
   * @param gameState 
   * @param initPos 
   */
  private static containsInitialFigure(gameState: GameState, initPos: Position): boolean {
    if (gameState.moveHistory.length === 0) {
      return getFigure(gameState, initPos) ? true : false;
    }

    if (gameState.moveHistory[0].board.getPiece(initPos) === gameState.board.getPiece(initPos))
      return true;
    return false;
  }

  private static getPlayer(gameState: GameState, color: ColorType): Player {
    return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
  }

  private static getEnPassantPos(gameState: GameState, pos: Position): Position | null {
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece || piece.getPiece() !== 'pawn') return null;
    if (gameState.moveHistory.length === 0) return null;

    const dir: Direction = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';

    const leftOffset: Position = {
      x: -1,
      y: 0,
    };

    const rightOffset: Position = {
      x: 1,
      y: 0,
    };

    const leftPos: Position | null = getPositionRelativeTo(pos, dir, leftOffset);

    const rightPos: Position | null = getPositionRelativeTo(pos, dir, rightOffset);

    const lastHistoryEntry: HistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];

    const moveOffset: Position = getMoveOffset(lastHistoryEntry.move, this.getDirection(gameState, lastHistoryEntry.piece));
    if (
      lastHistoryEntry.piece.getPiece() !== 'pawn' ||
      !(moveOffset.x === 0 && moveOffset.y === 2)
    ) {

      return null;
    }

    if (leftPos) {
      const leftPawn: Figure | null = getFigure(
        gameState,
        leftPos
      );
      if (leftPawn && leftPawn === lastHistoryEntry.piece) {
        const enPassantOffset: Position = { x: -1, y: 1 };
        const enPassantPos: Position = getPositionRelativeTo(pos, dir, enPassantOffset) as Position;
        const enPassantMove: Move = {
          start: pos,
          end: enPassantPos,
        }
        return enPassantPos;
      }
    }

    if (rightPos) {
      const rightPawn: Figure | null = getFigure(
        gameState,
        rightPos
      );
      if (rightPawn && rightPawn === lastHistoryEntry.piece) {
        const enPassantOffset: Position = { x: 1, y: 1 };
        const enPassantPos: Position = getPositionRelativeTo(pos, dir, enPassantOffset) as Position;
        const enPassantMove: Move = {
          start: pos,
          end: enPassantPos,
        }

        return enPassantPos;
      }
    }
    return null;
  }

  

  private static canAttackSquare(gameState: GameState, attackerPos: Position, squareToAttack: Position, attackingOffset: Position): boolean {
    const piece: Figure | null = getFigure(gameState, attackerPos);

    if (!piece) return false;

    const piece2: Figure | null = getFigure(gameState, squareToAttack);

    if (!piece2) return false;

    if (this.areAllies(piece, piece2)) return false;

    const calculatedSquare: Position | null = getPositionRelativeTo(attackerPos, this.getDirection(gameState, piece), attackingOffset);

    if (!calculatedSquare || !isSamePos(calculatedSquare, squareToAttack)) return false;

    return true;
  }



  private static areAllies(p1: Figure, p2: Figure): boolean {
    return p1.getColor() === p2.getColor();
  }

  private static flipSideToMove(gameState: GameState): void {
    gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
    gameState.hash! ^= getSideToMoveNumber();
  }

  /**
   * The same as *applyMoveDebug*, but throws the error on illegible move
   * @param gameState
   * @param move 
   */
  public static move(gameState: GameState, move: Move) {
    if (!this.applyMoveDebug(gameState, move))
      throw new Error(`Move ${move} is illegible`);
  }

  public static applyMove(gameState: GameState, entry: HistoryEntry): void {
    gameState.board.move(entry.move);

    const p: Figure = getFigure(gameState, entry.move.end) as Figure;

    gameState.moveHistory.push(entry);

    const move: Move = entry.move;

    if (entry.player.getColor() === 'black') {
      gameState.fullMoveCounter++;
    }

    if (entry.destroyedPiece) {
      const destroyedPiecePos: Position | null = this.getPiecePosition(gameState, entry.destroyedPiece);

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
    this.flipSideToMove(gameState);

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
    if (this.isHalfMove(entry)) {
      gameState.halfMoveClock++;
    } else {
      gameState.halfMoveClock = 0;
    }
    this.flushAllCaches();

  }

  /**
   * apply function for debugging purposes only
   * Applies a move to a chess board. If move is legible, returns true. Otherwise, returns false.
   * @param gameState 
   * @param move 
   * @returns 
   */
  public static applyMoveDebug(gameState: GameState, move: Move): boolean {
    const entry: HistoryEntry | undefined = this.getLegalMoves(gameState, move.start).find(e => isSameMove(e.move, move));

    if (!entry) return false;

    this.applyMove(gameState, entry);

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

  private static isPieceOnEndOfBoard(gameState: GameState, pos: Position): boolean {
    const piece: Figure | null = getFigure(gameState, pos);

    if (!piece) {
      return false;
    }

    const dir: Direction = this.getDirection(gameState, piece);

    return getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) ? false : true;
  }

  private static getPiecePosition(gameState: GameState, piece: Figure): Position | null {
    for (let y = 0; y <= 7; y++) {
      for (let x = 0; x <= 7; x++) {
        if (piece === gameState.board.grid[y][x]) {
          return { x: x, y: y };
        }
      }
    }
    return null;
  }

  private static getDirection(gameState: GameState, piece: Figure): Direction {
    return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
  }

  /**
   * Simulates a move and checks if king's checked after the move's made
   * @param gameState 
   * @param color 
   * @param move 
   * @returns 
   */
  private static isKingAttackedAfterMove(gameState: GameState, color: ColorType, move: Move): boolean {
    const newGameState: GameState | null = this.simulateMove(gameState, move);

    if (!newGameState) {
      throw new Error('Move`s not possible to simulate');
    }

    return this.isKingAttacked(newGameState, color);
  }

  /**
   * Checks if *isKingAttacked* if *side* will not make any move
   */
  private static isKingChecked(gameState: GameState, side: ColorType): boolean {
    const turn: ColorType = this.nextSideToMove(gameState);

    if (turn !== side) {
      throw new Error(`It's not ${side}'s turn to make a move!`);
    }

    const newGameState: GameState = cloneGameState(gameState);
    const kingPos: Position = findFigures(newGameState, ['king'], side)[0];

    // placing a dummy entry
    newGameState.moveHistory.push(
      this.buildHistoryEntry(
        newGameState,
        this.getMove({ ...kingPos }, { ...kingPos }),
        null,
        'move',
        { isPromotion: false }
      ) as HistoryEntry
    );

    return this.isKingAttacked(newGameState, side);
  }

  /*
  To check if the king of the given color is under attack, we need to check if a king's square is attacked.

  The king is considered under attack, if its square is immediately captured on the next opponent's move, and it's opponent's turn to make a move.
  */
  public static isKingAttacked(gameState: GameState, color: ColorType): boolean {
    const sideToMove: ColorType = this.nextSideToMove(gameState);
    const opponentColor: ColorType = color === 'white' ? 'black' : 'white';

    if (sideToMove !== opponentColor) {
      return false;
    }

    const figPositions: Position[] = findFigures(gameState, ['king'], color);

    if (figPositions.length === 0) {
      return false;
    }

    const kingPos: Position = figPositions[0];


    return this.isSquareAttackedBy(gameState, kingPos, opponentColor);
  }

  private static nextSideToMove(gameState: GameState): ColorType {
    const moveHistory = gameState.moveHistory;
    if (moveHistory.length === 0) {
      return 'white';
    }

    const lastEntry: HistoryEntry = moveHistory[moveHistory.length - 1];

    return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
  }


  /**
   * Simulates a move and returns a new gameState object with move applied
   * @returns a new GameState object or null
   */
  private static simulateMove(gameState: GameState, move: Move): GameState | null {
    const newGameState: GameState = cloneGameState(gameState);

    //console.log(newGameState);

    const entry: HistoryEntry | undefined = this.getMoves(newGameState, move.start).find(e => isSameMove(e.move, move));

    if (!entry)
      return null;

    const success = newGameState.board.move(move);

    if (!success) {
      return null;
    }

    if (entry.type === 'castling') {
      const castlingEntry: CastlingMoveInfo = entry as CastlingMoveInfo;
      newGameState.board.move(castlingEntry.rookMove);
      newGameState.moveHistory.push(castlingEntry);
    }
    else {
      newGameState.moveHistory.push(entry);
    }
    if (entry.destroyedPiece) {
      const destroyedPiecePos = this.getPiecePosition(newGameState, entry.destroyedPiece);
      if (destroyedPiecePos) {
        newGameState.board.removePiece(destroyedPiecePos);
      }
    }

    return success ? newGameState : null;
  }

  static isRankEndOfBoard(gameState: GameState, rank: number, side: ColorType): boolean {
    return gameState.player.getColor() === side ? rank === 7 : rank === 0;
  }

  public static isSquareAttackedBy(gameState: GameState, square: Position, attackerSide: ColorType): boolean {
    const attackerFigurePositions: Position[] = findFigures(gameState, 'all', attackerSide);

    for (const enemyPos of attackerFigurePositions) {
      const piece: Figure = getFigure(gameState, enemyPos) as Figure;

      const endPositions: Position[] = this.getMoves(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);

      if (endPositions.find(endP => isSamePos(endP, square))) return true;
    }

    return false;
  }

  private static isOccupied(gameState: GameState, pos: Position): boolean {
    return gameState.board.grid[pos.y][pos.x] ? true : false;
  }

  private static getMove(start: Position, end: Position): Move {
    if (!positionInGrid(start) || !positionInGrid(end)) throw new Error(`Any of the position are out of grid: ${start}, ${end}`);

    return {
      start: start,
      end: end,
    };
  }

  private static buildHistoryEntry(gameState: GameState, move: Move, destroyedPiece: Figure | null, actionType: ActionType, promotionDetails: PromotionDetails): HistoryEntry | null {
    const piece: Figure | null = getFigure(gameState, move.start);


    if (!piece) return null;

    const player: Player = this.getPlayer(gameState, piece.getColor());

    const opponentColor: ColorType = player.getColor() === 'white' ? 'black' : 'white';

    const board = new Board();
    board.grid = Board.cloneGrid(gameState.board.grid, false);

    const lastEntry: HistoryEntry | undefined = gameState.moveHistory.length === 0 ? undefined : gameState.moveHistory[gameState.moveHistory.length - 1];



    let historyEntry: HistoryEntry = {
      type: actionType,
      player: player,
      board: board,
      piece: piece,
      move: move,
      destroyedPiece: destroyedPiece,
      opponentKingChecked: false,
      prevDetails: {
        prevHalfMoveClock:
          lastEntry
            ? gameState.halfMoveClock
            : 0,
        prevFullMoveCounter: gameState.fullMoveCounter,
      },
      promotionDetails: { ...promotionDetails },
    }

    if (actionType === 'castling') {
      const isRightRook: boolean = getMoveOffset(move).x > 0 ? true : false;



      const rookPos: Position = parseAlgNotation(
        piece.getColor() === gameState.player.getColor()
          ? isRightRook ? 'h1' : 'a1'
          : isRightRook ? 'h8' : 'a8'
      );

      const rook: Figure | null = getFigure(gameState, rookPos);

      if (!rook) throw new Error('Rook not found');

      const rookMove: Move = this.getMove(rookPos, getPositionRelativeTo(rookPos, 'forward', { x: isRightRook ? -2 : 3, y: 0 }) as Position);

      const castlingDetails: CastlingDetails = `${rook.getColor() === 'white' ? 'w' : 'b'}${isRightRook ? 'k' : 'q'}`;

      const castlingEntry: HistoryEntry = {
        ...historyEntry,
        rookPiece: rook,
        rookMove: rookMove,
        castlingDetails: castlingDetails,
      }

      return castlingEntry;
    }

    if (actionType === 'enPassant') {
      const moveOffset: Position = { x: 0, y: -1 };
      const capturedPawnSquare: Position = getPositionRelativeTo(move.end, this.getDirection(gameState, piece), moveOffset) as Position;

      historyEntry.enPassantCapturedSquare = capturedPawnSquare;
    }

    return historyEntry;
  }

  private static getDestroyedPiece(gameState: GameState, attackerPiece: Figure, move: Move): Figure | null {
    if (!attackerPiece) return null;

    const player: Player = this.getPlayer(gameState, attackerPiece.getColor());

    const pieceToBeDestroyed: Figure | null = getFigure(gameState, move.end);

    if (!pieceToBeDestroyed) return null;

    if (this.areAllies(attackerPiece, pieceToBeDestroyed)) return null;

    return pieceToBeDestroyed;
  }

  /**
   * Checks if *move* is valid. Method works through searching *move* in result of *getMoves* method, therefore it's strictly **forbidden** to use in *getMoves* method and its alikes, e.g. *getPawnMoves*, *getKnightMoves*, etc
   * @param gameState 
   * @param move 
   * @returns 
   */
  private static validateMove(gameState: GameState, move: Move): HistoryEntry | null {
    const moves: HistoryEntry[] = this.getMoves(gameState, move.start);

    const entry: HistoryEntry | undefined = moves.find(mi => isSameMove(move, mi.move));

    if (!entry) return null;

    if (entry.type === 'castling') {
      const castlingEntry: CastlingMoveInfo = entry as CastlingMoveInfo;

      if (this.isValidCastlingEntry(gameState, castlingEntry)) {
        return castlingEntry;
      }
    }
    if (!this.isKingAttackedAfterMove(gameState, entry.player.getColor(), entry.move)) {
      return entry;
    }
    return null;
  }

  private static isValidCastlingEntry(gameState: GameState, castlingEntry: CastlingMoveInfo): boolean {
    if ('castling' !== castlingEntry.type) {
      return false;
    }
    if (this.isKingChecked(gameState, castlingEntry.player.getColor())) {
      return false;
    }

    const color: ColorType = castlingEntry.player.getColor();

    const rookPos: Position = castlingEntry.rookMove.start;

    const rook: Figure | null = getFigure(gameState, rookPos);

    if (!rook || castlingEntry.rookPiece !== rook) return false;
    if (!isFirstMove(gameState, rookPos)) {
      return false;
    }

    const kingPos: Position = castlingEntry.move.start;

    const king: Figure | null = getFigure(gameState, kingPos);

    if (!king || castlingEntry.piece !== king) {
      return false;
    }
    if (!isFirstMove(gameState, kingPos)) {
      return false;
    }

    const isKingSideCastling: boolean = getMoveOffset(castlingEntry.move).x > 0;

    let castlingPossible: boolean = true;
    if (isKingSideCastling) {
      for (let i = 1; i <= 2; i++) {
        const posOnPath: Position = getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 }) as Position;

        if (this.isOccupied(gameState, posOnPath) || this.isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), this.getMove(kingPos, posOnPath))) {
          return false;
        }
      }
    } else {
      for (let i = -1; i >= -3; i--) {
        const posOnPath: Position = getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 }) as Position;

        if (this.isOccupied(gameState, posOnPath) || this.isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), this.getMove(kingPos, posOnPath))) {
          return false;
        }
      }
    }

    return true;
  }

  public static placeFigure(gameState: GameState, pos: Position, figure: Figure): boolean {
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

  public static removeFigure(gameState: GameState, pos: Position): boolean {
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
}
