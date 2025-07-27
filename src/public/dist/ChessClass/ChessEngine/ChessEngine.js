"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessEngine = void 0;
const Board_1 = require("../Board/Board");
const Figure_1 = require("../Figure/Figure");
const Player_1 = require("../Player/Player");
const console_1 = require("console");
const MovesGenerator_1 = require("../Moves/MovesGenerator/MovesGenerator");
const historyUtils_1 = require("../utils/historyUtils");
const gameStateUtils_1 = require("../utils/gameStateUtils");
const LegalMoveValidation_1 = require("../Moves/LegalityChecks/LegalMoveValidation");
const Cache_1 = require("../Cache/Cache");
const HashConstants_1 = require("../Hashing/HashConstants");
const HashFunctions_1 = require("../Hashing/HashFunctions");
const evalGameStateUtils_1 = require("../utils/evalGameStateUtils");
class ChessEngine {
    static initGame(playerDetails, boardSetup, sideToMove) {
        const gameState = {
            player: playerDetails.player === 'human' ? new Player_1.HumanPlayer('white') : new Player_1.ComputerPlayer('white'),
            opponent: playerDetails.opponent === 'human' ? new Player_1.HumanPlayer('black') : new Player_1.ComputerPlayer('black'),
            board: new Board_1.Board(),
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
        gameState.castlingRights = (0, evalGameStateUtils_1.requestCastlingRights)(gameState);
        (0, HashFunctions_1.initGameStateHash)(gameState);
        (0, Cache_1.flushAllCaches)();
        return gameState;
    }
    static undoLastMove(gameState) {
        const history = gameState.moveHistory;
        if (history.length === 0)
            return false;
        const nextNextSideToMove = (0, gameStateUtils_1.nextSideToMove)(gameState);
        const lastEntry = history[history.length - 1];
        const preLastEntry = history.length >= 2 ? history[history.length - 2] : undefined;
        // popping last entry
        history.pop();
        // updating halfmove clock
        gameState.halfMoveClock = lastEntry.prevDetails.prevHalfMoveClock;
        const board = gameState.board;
        // updating full move counter
        gameState.fullMoveCounter = lastEntry.prevDetails.prevFullMoveCounter;
        // piece on end/start numbers
        const pieceOnEnd = board.getPiece(lastEntry.move.end);
        const pieceOnEndNumber = (0, HashConstants_1.getPieceNumber)(pieceOnEnd.getColor(), lastEntry.promotionDetails.isPromotion
            ? lastEntry.promotionDetails.promotedTo
            : pieceOnEnd.getPiece(), lastEntry.move.end);
        const pieceOnStartNumber = (0, HashConstants_1.getPieceNumber)(pieceOnEnd.getColor(), lastEntry.promotionDetails.isPromotion
            ? 'pawn'
            : pieceOnEnd.getPiece(), lastEntry.move.start);
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
                const destroyedPieceNumber = (0, HashConstants_1.getPieceNumber)(lastEntry.destroyedPiece.getColor(), lastEntry.destroyedPiece.getPiece(), lastEntry.move.end);
                gameState.hash ^= destroyedPieceNumber;
                board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
                board.place(lastEntry.destroyedPiece, lastEntry.move.end);
                break;
            }
            case 'enPassant': {
                gameState.hash ^= pieceOnEndNumber;
                gameState.hash ^= pieceOnStartNumber;
                const destroyedPieceNumber = (0, HashConstants_1.getPieceNumber)(lastEntry.destroyedPiece.getColor(), lastEntry.destroyedPiece.getPiece(), lastEntry.enPassantCapturedSquare);
                gameState.hash ^= destroyedPieceNumber;
                board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
                board.place(lastEntry.destroyedPiece, lastEntry.enPassantCapturedSquare);
                break;
            }
            case 'castling': {
                const castlingEntry = lastEntry;
                const kingOnEnd = board.getPiece(lastEntry.move.end);
                const kingOnEndNumber = (0, HashConstants_1.getPieceNumber)(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.end);
                const kingOnStartNumber = (0, HashConstants_1.getPieceNumber)(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.start);
                gameState.hash ^= kingOnEndNumber;
                gameState.hash ^= kingOnStartNumber;
                const rookStartPosNumber = (0, HashConstants_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);
                const rookEndPosNumber = (0, HashConstants_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);
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
        (0, gameStateUtils_1.flipSideToMove)(gameState);
        // restoring en passant file
        if (gameState.enPassantTargetFile !== null) {
            gameState.hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[gameState.enPassantTargetFile];
            gameState.enPassantTargetFile = null;
        }
        const restoredEnPassantFile = (0, evalGameStateUtils_1.getEnPassantFile)(gameState);
        if (restoredEnPassantFile !== null) {
            gameState.hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[restoredEnPassantFile];
            gameState.enPassantTargetFile = restoredEnPassantFile;
        }
        const hashBefore = gameState.hash;
        // restoring castling rights
        // firstly make all of the rights false
        let iter = 0;
        for (const color of ['white', 'black']) {
            for (const side of ['kingSide', 'queenSide']) {
                if (gameState.castlingRights[color][side]) {
                    gameState.hash ^= HashConstants_1.HASH_CASTLING_RIGHTS_NUMBERS[iter];
                }
                iter++;
            }
        }
        gameState.castlingRights = (0, evalGameStateUtils_1.requestCastlingRights)(gameState);
        iter = 0;
        for (const color of ['white', 'black']) {
            for (const side of ['kingSide', 'queenSide']) {
                if (gameState.castlingRights[color][side]) {
                    gameState.hash ^= HashConstants_1.HASH_CASTLING_RIGHTS_NUMBERS[iter];
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
    static setupBoard(board) {
        const secondRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let x = 0; x <= 7; x++) {
            board.place(new Figure_1.Figure('white', 'pawn'), { x: x, y: 1 });
            board.place(new Figure_1.Figure('white', secondRow[x]), { x: x, y: 0 });
            board.place(new Figure_1.Figure('black', 'pawn'), { x: x, y: 6 });
            board.place(new Figure_1.Figure('black', secondRow[x]), { x: x, y: 7 });
        }
    }
    static getLegalMoves(gameState, position) {
        if (!gameState.hash)
            (0, HashFunctions_1.initGameStateHash)(gameState);
        const key = `${gameState.hash}:${position.x}${position.y}`;
        let legalMoves = Cache_1.LEGAL_MOVES_CACHE.get(key);
        if (legalMoves) {
            return legalMoves;
        }
        legalMoves = (0, LegalMoveValidation_1.filterMoves)(gameState, (0, MovesGenerator_1.getMoves)(gameState, position));
        Cache_1.LEGAL_MOVES_CACHE.set(key, legalMoves);
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
    static applyMove(gameState, entry) {
        gameState.board.move(entry.move);
        const board = gameState.board;
        const p = board.getPiece(entry.move.end);
        gameState.moveHistory.push(entry);
        const move = entry.move;
        if (entry.player.getColor() === 'black') {
            gameState.fullMoveCounter++;
        }
        if (entry.destroyedPiece) {
            const destroyedPiecePos = (0, gameStateUtils_1.getPiecePosition)(gameState, entry.destroyedPiece);
            if (destroyedPiecePos) {
                gameState.board.removePiece(destroyedPiecePos);
            }
        }
        if (entry.promotionDetails.isPromotion) {
            entry.piece.setPiece(entry.promotionDetails.promotedTo);
            //console.log(gameState.moveHistory);
        }
        (0, console_1.assert)(gameState.hash !== undefined);
        // updating hash
        // updating en passant target file
        // xor out prev if present
        const enPassantPrevFile = gameState.enPassantTargetFile;
        if (enPassantPrevFile !== null) {
            gameState.hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[enPassantPrevFile];
        }
        // xor in new file if present
        gameState.enPassantTargetFile = (0, evalGameStateUtils_1.getEnPassantFile)(gameState);
        if (gameState.enPassantTargetFile !== null) {
            gameState.hash ^= HashConstants_1.HASH_EN_PASSANT_FILES_NUMBERS[gameState.enPassantTargetFile];
        }
        // hash for side to move
        (0, gameStateUtils_1.flipSideToMove)(gameState);
        const [color, pieceType] = [entry.piece.getColor(), entry.piece.getPiece()];
        switch (entry.type) {
            case 'castling': {
                const castlingEntry = entry;
                // update castling rights in gamestate
                const castlingColor = castlingEntry.castlingDetails.at(0) === 'w' ? 'white' : 'black';
                const castlingSide = castlingEntry.castlingDetails.at(1) === 'k' ? 'kingSide' : 'queenSide';
                gameState.castlingRights[castlingColor][castlingSide] = false;
                let castlingRightNumber = castlingSide === 'queenSide' ? 1 : 0;
                castlingRightNumber += castlingColor === 'black' ? 2 : 0;
                gameState.hash ^= HashConstants_1.HASH_CASTLING_RIGHTS_NUMBERS[castlingRightNumber];
                // xor out init rook pos
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);
                // xor in new position
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);
                // placing a rook into a new position
                gameState.board.move(castlingEntry.rookMove);
            }
            case 'move': {
                // xor out init pos
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);
                // xor in new position
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(color, pieceType, move.end);
                break;
            }
            case 'enPassant':
            case 'attackMove': {
                // xor out init pos 
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);
                // xor out piece on end pos
                if (entry.destroyedPiece) {
                    const destroyedPiecePos = entry.type === 'attackMove' ? move.end : entry.enPassantCapturedSquare;
                    gameState.hash ^= (0, HashConstants_1.getPieceNumber)(entry.destroyedPiece.getColor(), entry.destroyedPiece.getPiece(), destroyedPiecePos);
                }
                // xor in new position
                gameState.hash ^= (0, HashConstants_1.getPieceNumber)(color, pieceType, move.end);
                break;
            }
        }
        // update halfmove clock counter
        if ((0, historyUtils_1.isHalfMove)(entry)) {
            gameState.halfMoveClock++;
        }
        else {
            gameState.halfMoveClock = 0;
        }
        (0, Cache_1.flushAllCaches)();
    }
}
exports.ChessEngine = ChessEngine;
//# sourceMappingURL=ChessEngine.js.map