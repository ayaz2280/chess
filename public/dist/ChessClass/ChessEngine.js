"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessEngine = void 0;
const Board_1 = require("./Board");
const constants_1 = require("./constants");
const Figure_1 = require("./Figure/Figure");
const Board_2 = require("./Board");
const HelperFunctions_1 = require("./HelperFunctions");
const Player_1 = require("./Player");
const GameStateHelperFunctions_1 = require("./GameStateHelperFunctions");
const console_1 = require("console");
const node_cache_1 = __importDefault(require("node-cache"));
class ChessEngine {
    static legalMovesCache = new node_cache_1.default({ useClones: false });
    static pseudoLegalMovesCache = new node_cache_1.default({ useClones: false });
    static flushAllCaches() {
        this.legalMovesCache.flushAll();
        this.pseudoLegalMovesCache.flushAll();
    }
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
        gameState.castlingRights = this.requestCastlingRights(gameState);
        (0, GameStateHelperFunctions_1.initGameStateHash)(gameState);
        this.flushAllCaches();
        return gameState;
    }
    static isHalfMove(entry) {
        if (entry.type === 'attackMove' || entry.type === 'checkmate' || entry.type === 'enPassant') {
            return false;
        }
        if (entry.piece.getPiece() === 'pawn') {
            return false;
        }
        return true;
    }
    static undoLastMove(gameState) {
        const history = gameState.moveHistory;
        if (history.length === 0)
            return false;
        const nextNextSideToMove = this.nextSideToMove(gameState);
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
        const pieceOnEnd = this.getFigure(gameState, lastEntry.move.end);
        const pieceOnEndNumber = (0, HelperFunctions_1.getPieceNumber)(pieceOnEnd.getColor(), lastEntry.promotionDetails.isPromotion
            ? lastEntry.promotionDetails.promotedTo
            : pieceOnEnd.getPiece(), lastEntry.move.end);
        const pieceOnStartNumber = (0, HelperFunctions_1.getPieceNumber)(pieceOnEnd.getColor(), lastEntry.promotionDetails.isPromotion
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
                const destroyedPieceNumber = (0, HelperFunctions_1.getPieceNumber)(lastEntry.destroyedPiece.getColor(), lastEntry.destroyedPiece.getPiece(), lastEntry.move.end);
                gameState.hash ^= destroyedPieceNumber;
                board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
                board.place(lastEntry.destroyedPiece, lastEntry.move.end);
                break;
            }
            case 'enPassant': {
                gameState.hash ^= pieceOnEndNumber;
                gameState.hash ^= pieceOnStartNumber;
                const destroyedPieceNumber = (0, HelperFunctions_1.getPieceNumber)(lastEntry.destroyedPiece.getColor(), lastEntry.destroyedPiece.getPiece(), lastEntry.enPassantCapturedSquare);
                gameState.hash ^= destroyedPieceNumber;
                board.move({ start: lastEntry.move.end, end: lastEntry.move.start });
                board.place(lastEntry.destroyedPiece, lastEntry.enPassantCapturedSquare);
                break;
            }
            case 'castling': {
                const castlingEntry = lastEntry;
                const kingOnEnd = this.getFigure(gameState, lastEntry.move.end);
                const kingOnEndNumber = (0, HelperFunctions_1.getPieceNumber)(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.end);
                const kingOnStartNumber = (0, HelperFunctions_1.getPieceNumber)(kingOnEnd.getColor(), kingOnEnd.getPiece(), lastEntry.move.start);
                gameState.hash ^= kingOnEndNumber;
                gameState.hash ^= kingOnStartNumber;
                const rookStartPosNumber = (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);
                const rookEndPosNumber = (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);
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
        this.flipSideToMove(gameState);
        // restoring en passant file
        if (gameState.enPassantTargetFile !== null) {
            gameState.hash ^= (0, HelperFunctions_1.getFilesEnPassantNumbers)()[gameState.enPassantTargetFile];
            gameState.enPassantTargetFile = null;
        }
        const restoredEnPassantFile = this.getEnPassantFile(gameState);
        if (restoredEnPassantFile !== null) {
            gameState.hash ^= (0, HelperFunctions_1.getFilesEnPassantNumbers)()[restoredEnPassantFile];
            gameState.enPassantTargetFile = restoredEnPassantFile;
        }
        const hashBefore = gameState.hash;
        // restoring castling rights
        // firstly make all of the rights false
        let iter = 0;
        for (const color of ['white', 'black']) {
            for (const side of ['kingSide', 'queenSide']) {
                if (gameState.castlingRights[color][side]) {
                    gameState.hash ^= (0, HelperFunctions_1.getCastlingRightsNumbers)()[iter];
                }
                iter++;
            }
        }
        gameState.castlingRights = this.requestCastlingRights(gameState);
        iter = 0;
        for (const color of ['white', 'black']) {
            for (const side of ['kingSide', 'queenSide']) {
                if (gameState.castlingRights[color][side]) {
                    gameState.hash ^= (0, HelperFunctions_1.getCastlingRightsNumbers)()[iter];
                }
                iter++;
            }
        }
        return true;
    }
    static requestCastlingRights(gameState) {
        const whiteKingPositions = this.findFigures(gameState, ['king'], 'white');
        const blackKingPositions = this.findFigures(gameState, ['king'], 'black');
        if (whiteKingPositions.length !== 1 || blackKingPositions.length !== 1) {
            return {
                white: { 'kingSide': false, 'queenSide': false },
                black: { 'kingSide': false, 'queenSide': false },
            };
        }
        const whiteKingPos = whiteKingPositions[0];
        const blackKingPos = blackKingPositions[0];
        const castlingRights = {
            white: {
                queenSide: this.hasCastlingRight(gameState, 'white', 'queenSide'),
                kingSide: this.hasCastlingRight(gameState, 'white', 'kingSide'),
            },
            black: {
                queenSide: this.hasCastlingRight(gameState, 'black', 'queenSide'),
                kingSide: this.hasCastlingRight(gameState, 'black', 'kingSide'),
            }
        };
        return castlingRights;
    }
    /**
     * Returns whether the king of *playerColor* may castle from *side* now or in the future.
     * @param gameState
     * @param playerColor
     * @param side
     * @returns
     */
    static hasCastlingRight(gameState, playerColor, side) {
        const kingPos = this.findFigures(gameState, ['king'], playerColor)[0];
        if (!this.isFirstMove(gameState, kingPos)) {
            return false;
        }
        const expectedRookPos = this.getPositionRelativeTo(kingPos, 'forward', side === 'kingSide' ? this.getMoveOffset((0, HelperFunctions_1.parseMove)('e1-h1')) : this.getMoveOffset((0, HelperFunctions_1.parseMove)('e1-a1')));
        const rookPos = this.findFigures(gameState, ['rook'], playerColor).find(pos => (0, HelperFunctions_1.isSamePos)(expectedRookPos, pos));
        if (!rookPos)
            return false;
        if (!this.isFirstMove(gameState, rookPos))
            return false;
        return true;
    }
    static getEnPassantFile(gameState) {
        if (gameState.moveHistory.length === 0)
            return null;
        const lastEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
        const moveOffset = this.getMoveOffset(lastEntry.move);
        if (lastEntry.piece.getPiece() !== 'pawn' || !(Math.abs(moveOffset.y) === 2 && Math.abs(moveOffset.x) === 0)) {
            return null;
        }
        const file = lastEntry.move.end.x;
        return file;
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
    /**
     * Returns array of all possible moves for selected piece
     * @param gameState
     * @param position a position of a piece to  obtain legal moves from
     */
    static getMoves(gameState, position, types) {
        const uniqueTypes = types ? (0, HelperFunctions_1.getUniqueArray)(types) : undefined;
        let pseudoLegalMoves = [];
        if (!gameState.board.grid[position.y][position.x])
            return pseudoLegalMoves;
        if (!gameState.hash)
            (0, GameStateHelperFunctions_1.initGameStateHash)(gameState);
        const typesKey = uniqueTypes ? uniqueTypes.join('_') : 'all';
        const key = `${gameState.hash}:${position.x}${position.y}:${typesKey}`;
        pseudoLegalMoves = this.pseudoLegalMovesCache.get(key);
        if (pseudoLegalMoves) {
            return pseudoLegalMoves;
        }
        pseudoLegalMoves = [];
        const piece = gameState.board.grid[position.y][position.x];
        const pieceType = piece.getPiece();
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
    static getLegalMoves(gameState, position) {
        if (!gameState.hash)
            (0, GameStateHelperFunctions_1.initGameStateHash)(gameState);
        const key = `${gameState.hash}:${position.x}${position.y}`;
        let legalMoves = this.legalMovesCache.get(key);
        if (legalMoves) {
            return legalMoves;
        }
        legalMoves = this.filterMoves(gameState, this.getMoves(gameState, position));
        this.legalMovesCache.set(key, legalMoves);
        return legalMoves;
    }
    static getPawnMoves(gameState, pos, types) {
        const board = gameState.board;
        const piece = board.grid[pos.y][pos.x];
        let entry;
        let move;
        if (!piece || !(piece.getPiece() === 'pawn'))
            return [];
        const moves = [];
        const dir = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
        let isPromotionMove = false;
        // moves of type 'move'
        if (!types ||
            types.includes('move')) {
            if (this.isFirstMove(gameState, pos)) {
                const offset = {
                    x: 0,
                    y: 2,
                };
                const twoSquareAhead = this.getPositionRelativeTo(pos, dir, offset);
                const oneSquareAhead = this.getPositionRelativeTo(pos, dir, { x: 0, y: 1 });
                if (twoSquareAhead &&
                    !this.isOccupied(gameState, twoSquareAhead) &&
                    !this.isOccupied(gameState, oneSquareAhead)) {
                    move = this.getMove(pos, twoSquareAhead);
                    entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });
                    if (entry) {
                        moves.push(entry);
                    }
                }
            }
            // check for 1 square move
            const oneSquareAhead = this.getPositionRelativeTo(pos, dir, {
                x: 0,
                y: 1,
            });
            if (oneSquareAhead) {
                const moveOneSquare = {
                    start: pos,
                    end: oneSquareAhead,
                };
                if (!this.isOccupied(gameState, oneSquareAhead)) {
                    move = this.getMove(pos, oneSquareAhead);
                    if (this.isRankEndOfBoard(gameState, oneSquareAhead.y, piece.getColor())) {
                        const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                        figureTypes.forEach((figType) => {
                            entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });
                            if (entry) {
                                moves.push(entry);
                            }
                        });
                    }
                    else {
                        entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: false });
                        if (entry) {
                            moves.push(entry);
                        }
                    }
                }
            }
        }
        // moves of type 'attackMove'
        if (!types ||
            types.includes('attackMove')) {
            // check for diagonal attacking moves
            const leftDiagonalOffset = {
                x: -1,
                y: 1,
            };
            const rightDiagonalOffset = {
                x: 1,
                y: 1,
            };
            const leftDiagonal = this.getPositionRelativeTo(pos, dir, leftDiagonalOffset);
            const rightDiagonal = this.getPositionRelativeTo(pos, dir, rightDiagonalOffset);
            if (leftDiagonal) {
                if (this.canAttackSquare(gameState, pos, leftDiagonal, leftDiagonalOffset)) {
                    move = this.getMove(pos, leftDiagonal);
                    if (this.isRankEndOfBoard(gameState, leftDiagonal.y, piece.getColor())) {
                        const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                        figureTypes.forEach((figType) => {
                            entry = this.buildHistoryEntry(gameState, move, null, 'move', { isPromotion: true, promotedTo: figType });
                            if (entry) {
                                moves.push(entry);
                            }
                        });
                    }
                    else {
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
                    const destroyedPiece = this.getFigure(gameState, move.end);
                    if (this.isRankEndOfBoard(gameState, rightDiagonal.y, piece.getColor())) {
                        const figureTypes = ['bishop', 'knight', 'queen', 'rook'];
                        figureTypes.forEach((figType) => {
                            entry = this.buildHistoryEntry(gameState, move, destroyedPiece, 'attackMove', { isPromotion: true, promotedTo: figType });
                            if (entry) {
                                moves.push(entry);
                            }
                        });
                    }
                    else {
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
            const enPassantPos = this.getEnPassantPos(gameState, pos);
            if (enPassantPos) {
                move = this.getMove(pos, enPassantPos);
                entry = this.buildHistoryEntry(gameState, move, this.getFigure(gameState, this.getPositionRelativeTo(enPassantPos, dir, { x: 0, y: -1 })), 'enPassant', { isPromotion: false });
                if (entry) {
                    moves.push(entry);
                }
            }
        }
        return moves;
    }
    /*
    public static promotePawn(gameState: GameState, pos: Position, pieceOfChoice: Exclude<FigureType, 'king' | 'pawn'>): boolean {
      const piece: Figure | null = this.getFigure(gameState, pos);
  
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
    static getKnightMoves(gameState, pos, types) {
        const moves = [];
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return moves;
        const pseudoLegalKnightPositions = constants_1.KNIGHT_OFFSETS
            .map(a => { return { ...a }; })
            .filter(offset => {
            const end = this.getPositionRelativeTo(pos, 'forward', offset);
            if (!end) {
                return false;
            }
            const move = this.getMove(pos, end);
            const pieceOnSquare = this.getFigure(gameState, end);
            if (pieceOnSquare && this.areAllies(piece, pieceOnSquare)) {
                return false;
            }
            return true;
        })
            .map(offset => {
            return this.getPositionRelativeTo(pos, 'forward', offset);
        });
        for (const endPos of pseudoLegalKnightPositions) {
            const destroyedPiece = this.getFigure(gameState, endPos);
            if (!destroyedPiece && (!types || types.includes('move'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }));
            }
            if (destroyedPiece && (!types || types.includes('attackMove'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
            }
        }
        return moves;
    }
    static getRookMoves(gameState, pos, types) {
        const moves = [];
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return moves;
        const pseudoLegalRookPositions = constants_1.ROOK_OFFSET_PATHS
            .flatMap(offsetPath => {
            const legitPositions = [];
            for (const offset of offsetPath) {
                const resPos = this.getPositionRelativeTo(pos, 'forward', offset);
                if (!resPos)
                    break;
                const pieceOnSquare = this.getFigure(gameState, resPos);
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
            const destroyedPiece = this.getFigure(gameState, endPos);
            if (!destroyedPiece && (!types || types.includes('move'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }));
            }
            if (destroyedPiece && (!types || types.includes('attackMove'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
            }
        }
        return moves;
    }
    static getBishopMoves(gameState, pos, types) {
        const moves = [];
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return moves;
        const pseudoLegalBishopPositions = constants_1.BISHOP_OFFSET_PATHS
            .flatMap(offsetPath => {
            const legitPositions = [];
            for (const offset of offsetPath) {
                const resPos = this.getPositionRelativeTo(pos, 'forward', offset);
                if (!resPos)
                    break;
                const pieceOnSquare = this.getFigure(gameState, resPos);
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
            const destroyedPiece = this.getFigure(gameState, endPos);
            if (!destroyedPiece && (!types || types.includes('move'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }));
            }
            if (destroyedPiece && (!types || types.includes('attackMove'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
            }
        }
        return moves;
    }
    static getQueenMoves(gameState, pos, types) {
        const moves = [];
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return moves;
        const pseudoLegalQueenPositions = constants_1.QUEEN_OFFSET_PATHS
            .flatMap(offsetPath => {
            const legitPositions = [];
            for (const offset of offsetPath) {
                const resPos = this.getPositionRelativeTo(pos, 'forward', offset);
                if (!resPos)
                    break;
                const pieceOnSquare = this.getFigure(gameState, resPos);
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
            const destroyedPiece = this.getFigure(gameState, endPos);
            if (!destroyedPiece && (!types || types.includes('move'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }));
            }
            if (destroyedPiece && (!types || types.includes('attackMove'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
            }
        }
        return moves;
    }
    static getKingMoves(gameState, pos, types) {
        const moves = [];
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return moves;
        const pseudoLegalKingPositions = constants_1.KING_OFFSETS
            .flatMap(offset => {
            const resPos = this.getPositionRelativeTo(pos, 'forward', offset);
            if (!resPos)
                return [];
            const pieceOnSquare = this.getFigure(gameState, resPos);
            if (pieceOnSquare && this.areAllies(piece, pieceOnSquare))
                return [];
            return [resPos];
        });
        for (const endPos of pseudoLegalKingPositions) {
            const destroyedPiece = this.getFigure(gameState, endPos);
            if (!destroyedPiece && (!types || types.includes('move'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), null, 'move', { isPromotion: false }));
            }
            if (destroyedPiece && (!types || types.includes('attackMove'))) {
                moves.push(this.buildHistoryEntry(gameState, this.getMove(pos, endPos), destroyedPiece, 'attackMove', { isPromotion: false }));
            }
        }
        if (!types || types.includes('castling')) {
            moves.push(...this.getCastlingMoves(gameState, pos));
        }
        return moves;
    }
    static getCastlingMoves(gameState, kingPos) {
        const moves = [];
        const piece = this.getFigure(gameState, kingPos);
        if (!piece || piece.getPiece() !== 'king') {
            return moves;
        }
        if (!this.isFirstMove(gameState, kingPos) || this.isKingChecked(gameState, piece.getColor())) {
            return moves;
        }
        // Checking if rooks are on their places
        const dir = this.getDirection(gameState, piece);
        const [leftRookInitPos, rightRookInitPos] = [
            this.getPositionRelativeTo(kingPos, 'forward', { x: -4, y: 0 }),
            this.getPositionRelativeTo(kingPos, 'forward', { x: 3, y: 0 }),
        ];
        const [leftRookOnPlace, rightRookOnPlace] = [this.containsInitialFigure(gameState, leftRookInitPos), this.containsInitialFigure(gameState, rightRookInitPos)];
        // Checking the path
        let castlingPossible = true;
        if (leftRookOnPlace) {
            for (let i = 1; i <= 3; i++) {
                const posOnPath = this.getPositionRelativeTo(kingPos, 'forward', { x: -1 * i, y: 0 });
                if (this.isOccupied(gameState, posOnPath)) {
                    castlingPossible = false;
                    break;
                }
            }
            if (castlingPossible) {
                const move = this.getMove(kingPos, this.getPositionRelativeTo(kingPos, 'forward', { x: -2, y: 0 }));
                moves.push(this.buildHistoryEntry(gameState, move, null, 'castling', { isPromotion: false }));
            }
        }
        castlingPossible = true;
        if (rightRookOnPlace) {
            for (let i = 1; i <= 2; i++) {
                const posOnPath = this.getPositionRelativeTo(kingPos, 'forward', { x: i, y: 0 });
                if (this.isOccupied(gameState, posOnPath)) {
                    castlingPossible = false;
                    break;
                }
            }
            if (castlingPossible) {
                const move = this.getMove(kingPos, this.getPositionRelativeTo(kingPos, 'forward', { x: 2, y: 0 }));
                moves.push(this.buildHistoryEntry(gameState, move, null, 'castling', { isPromotion: false }));
            }
        }
        return moves;
    }
    static filterMoves(gameState, entries) {
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
    static containsInitialFigure(gameState, initPos) {
        if (gameState.moveHistory.length === 0) {
            return this.getFigure(gameState, initPos) ? true : false;
        }
        if (gameState.moveHistory[0].board.getPiece(initPos) === gameState.board.getPiece(initPos))
            return true;
        return false;
    }
    static getPlayer(gameState, color) {
        return color === gameState.player.getColor() ? gameState.player : gameState.opponent;
    }
    static getEnPassantPos(gameState, pos) {
        const piece = this.getFigure(gameState, pos);
        if (!piece || piece.getPiece() !== 'pawn')
            return null;
        if (gameState.moveHistory.length === 0)
            return null;
        const dir = piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
        const leftOffset = {
            x: -1,
            y: 0,
        };
        const rightOffset = {
            x: 1,
            y: 0,
        };
        const leftPos = this.getPositionRelativeTo(pos, dir, leftOffset);
        const rightPos = this.getPositionRelativeTo(pos, dir, rightOffset);
        const lastHistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
        const moveOffset = this.getMoveOffset(lastHistoryEntry.move, this.getDirection(gameState, lastHistoryEntry.piece));
        if (lastHistoryEntry.piece.getPiece() !== 'pawn' ||
            !(moveOffset.x === 0 && moveOffset.y === 2)) {
            return null;
        }
        if (leftPos) {
            const leftPawn = this.getFigure(gameState, leftPos);
            if (leftPawn && leftPawn === lastHistoryEntry.piece) {
                const enPassantOffset = { x: -1, y: 1 };
                const enPassantPos = this.getPositionRelativeTo(pos, dir, enPassantOffset);
                const enPassantMove = {
                    start: pos,
                    end: enPassantPos,
                };
                return enPassantPos;
            }
        }
        if (rightPos) {
            const rightPawn = this.getFigure(gameState, rightPos);
            if (rightPawn && rightPawn === lastHistoryEntry.piece) {
                const enPassantOffset = { x: 1, y: 1 };
                const enPassantPos = this.getPositionRelativeTo(pos, dir, enPassantOffset);
                const enPassantMove = {
                    start: pos,
                    end: enPassantPos,
                };
                return enPassantPos;
            }
        }
        return null;
    }
    /**
     * Returns move offset
     * @param move
     * @param direction align offset according with direction
     * @returns
     */
    static getMoveOffset(move, direction = 'forward') {
        let directionCoefficient = direction === 'forward' ? 1 : -1;
        return {
            x: directionCoefficient * (move.end.x - move.start.x),
            y: directionCoefficient * (move.end.y - move.start.y),
        };
    }
    static canAttackSquare(gameState, attackerPos, squareToAttack, attackingOffset) {
        const piece = this.getFigure(gameState, attackerPos);
        if (!piece)
            return false;
        const piece2 = this.getFigure(gameState, squareToAttack);
        if (!piece2)
            return false;
        if (this.areAllies(piece, piece2))
            return false;
        const calculatedSquare = this.getPositionRelativeTo(attackerPos, this.getDirection(gameState, piece), attackingOffset);
        if (!calculatedSquare || !(0, HelperFunctions_1.isSamePos)(calculatedSquare, squareToAttack))
            return false;
        return true;
    }
    static areAllies(p1, p2) {
        return p1.getColor() === p2.getColor();
    }
    static flipSideToMove(gameState) {
        gameState.sideToMove = gameState.sideToMove === 'white' ? 'black' : 'white';
        gameState.hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
    }
    /**
     * The same as *applyMoveDebug*, but throws the error on illegible move
     * @param gameState
     * @param move
     */
    static move(gameState, move) {
        if (!this.applyMoveDebug(gameState, move))
            throw new Error(`Move ${move} is illegible`);
    }
    static applyMove(gameState, entry) {
        gameState.board.move(entry.move);
        const p = this.getFigure(gameState, entry.move.end);
        gameState.moveHistory.push(entry);
        const move = entry.move;
        if (entry.player.getColor() === 'black') {
            gameState.fullMoveCounter++;
        }
        if (entry.destroyedPiece) {
            const destroyedPiecePos = this.getPiecePosition(gameState, entry.destroyedPiece);
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
        const enPassantNumbers = (0, HelperFunctions_1.getFilesEnPassantNumbers)();
        if (enPassantPrevFile !== null) {
            gameState.hash ^= enPassantNumbers[enPassantPrevFile];
        }
        // xor in new file if present
        gameState.enPassantTargetFile = this.getEnPassantFile(gameState);
        if (gameState.enPassantTargetFile !== null) {
            gameState.hash ^= enPassantNumbers[gameState.enPassantTargetFile];
        }
        // hash for side to move
        this.flipSideToMove(gameState);
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
                gameState.hash ^= (0, HelperFunctions_1.getCastlingRightsNumbers)()[castlingRightNumber];
                // xor out init rook pos
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.start);
                // xor in new position
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(castlingEntry.rookPiece.getColor(), castlingEntry.rookPiece.getPiece(), castlingEntry.rookMove.end);
                // placing a rook into a new position
                gameState.board.move(castlingEntry.rookMove);
            }
            case 'move': {
                // xor out init pos
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);
                // xor in new position
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, move.end);
                break;
            }
            case 'enPassant':
            case 'attackMove': {
                // xor out init pos 
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, entry.promotionDetails.isPromotion ? 'pawn' : pieceType, move.start);
                // xor out piece on end pos
                if (entry.destroyedPiece) {
                    const destroyedPiecePos = entry.type === 'attackMove' ? move.end : entry.enPassantCapturedSquare;
                    gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(entry.destroyedPiece.getColor(), entry.destroyedPiece.getPiece(), destroyedPiecePos);
                }
                // xor in new position
                gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(color, pieceType, move.end);
                break;
            }
        }
        // update halfmove clock counter
        if (this.isHalfMove(entry)) {
            gameState.halfMoveClock++;
        }
        else {
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
    static applyMoveDebug(gameState, move) {
        const entry = this.getLegalMoves(gameState, move.start).find(e => (0, HelperFunctions_1.isSameMove)(e.move, move));
        if (!entry)
            return false;
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
    static isPieceOnEndOfBoard(gameState, pos) {
        const piece = this.getFigure(gameState, pos);
        if (!piece) {
            return false;
        }
        const dir = this.getDirection(gameState, piece);
        return this.getPositionRelativeTo(pos, dir, { x: 0, y: 1 }) ? false : true;
    }
    static getPiecePosition(gameState, piece) {
        for (let y = 0; y <= 7; y++) {
            for (let x = 0; x <= 7; x++) {
                if (piece === gameState.board.grid[y][x]) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    }
    static getDirection(gameState, piece) {
        return piece.getColor() === gameState.player.getColor() ? 'forward' : 'backward';
    }
    /**
     * Simulates a move and checks if king's checked after the move's made
     * @param gameState
     * @param color
     * @param move
     * @returns
     */
    static isKingAttackedAfterMove(gameState, color, move) {
        const newGameState = this.simulateMove(gameState, move);
        if (!newGameState) {
            throw new Error('Move`s not possible to simulate');
        }
        return this.isKingAttacked(newGameState, color);
    }
    /**
     * Checks if *isKingAttacked* if *side* will not make any move
     */
    static isKingChecked(gameState, side) {
        const turn = this.nextSideToMove(gameState);
        if (turn !== side) {
            throw new Error(`It's not ${side}'s turn to make a move!`);
        }
        const newGameState = (0, GameStateHelperFunctions_1.cloneGameState)(gameState);
        const kingPos = this.findFigures(newGameState, ['king'], side)[0];
        // placing a dummy entry
        newGameState.moveHistory.push(this.buildHistoryEntry(newGameState, this.getMove({ ...kingPos }, { ...kingPos }), null, 'move', { isPromotion: false }));
        return this.isKingAttacked(newGameState, side);
    }
    /*
    To check if the king of the given color is under attack, we need to check if a king's square is attacked.
  
    The king is considered under attack, if its square is immediately captured on the next opponent's move, and it's opponent's turn to make a move.
    */
    static isKingAttacked(gameState, color) {
        const sideToMove = this.nextSideToMove(gameState);
        const opponentColor = color === 'white' ? 'black' : 'white';
        if (sideToMove !== opponentColor) {
            return false;
        }
        const figPositions = this.findFigures(gameState, ['king'], color);
        if (figPositions.length === 0) {
            return false;
        }
        const kingPos = figPositions[0];
        return this.isSquareAttackedBy(gameState, kingPos, opponentColor);
    }
    static nextSideToMove(gameState) {
        const moveHistory = gameState.moveHistory;
        if (moveHistory.length === 0) {
            return 'white';
        }
        const lastEntry = moveHistory[moveHistory.length - 1];
        return 'white' === lastEntry.player.getColor() ? 'black' : 'white';
    }
    static findFigures(gameState, pieceTypes, color) {
        const found = [];
        const uniquePieceTypes = pieceTypes === 'all'
            ? ['bishop', 'king', 'knight', 'pawn', 'queen', 'rook']
            : (0, HelperFunctions_1.getUniqueArray)(pieceTypes);
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pos = { x: x, y: y };
                const piece = this.getFigure(gameState, pos);
                if (!piece)
                    continue;
                if ((color === 'both' || color === piece.getColor()) &&
                    uniquePieceTypes.includes(piece.getPiece()))
                    found.push(pos);
            }
        }
        return found;
    }
    /**
     * Simulates a move and returns a new gameState object with move applied
     * @returns a new GameState object or null
     */
    static simulateMove(gameState, move) {
        const newGameState = (0, GameStateHelperFunctions_1.cloneGameState)(gameState);
        //console.log(newGameState);
        const entry = this.getMoves(newGameState, move.start).find(e => (0, HelperFunctions_1.isSameMove)(e.move, move));
        if (!entry)
            return null;
        const success = newGameState.board.move(move);
        if (!success) {
            return null;
        }
        if (entry.type === 'castling') {
            const castlingEntry = entry;
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
    static isRankEndOfBoard(gameState, rank, side) {
        return gameState.player.getColor() === side ? rank === 7 : rank === 0;
    }
    static isSquareAttackedBy(gameState, square, attackerSide) {
        const attackerFigurePositions = this.findFigures(gameState, 'all', attackerSide);
        for (const enemyPos of attackerFigurePositions) {
            const piece = this.getFigure(gameState, enemyPos);
            const endPositions = this.getMoves(gameState, enemyPos, ['attackMove']).map(entry => entry.move.end);
            if (endPositions.find(endP => (0, HelperFunctions_1.isSamePos)(endP, square)))
                return true;
        }
        return false;
    }
    static isOccupied(gameState, pos) {
        return gameState.board.grid[pos.y][pos.x] ? true : false;
    }
    /**
     * Gets a position adding *pos* and *offset*
     *
     * **Use *direction === 'forward'* if piece doesn't depend on direction!**
     * @param pos
     * @param dir
     * @param offset
     * @returns
     */
    static getPositionRelativeTo(pos, dir, offset) {
        let resPosition;
        if (dir === 'forward') {
            resPosition = {
                x: pos.x + offset.x,
                y: pos.y + offset.y,
            };
        }
        else {
            resPosition = {
                x: pos.x - offset.x,
                y: pos.y - offset.y,
            };
        }
        if (!(0, HelperFunctions_1.inRange)(resPosition.x, 0, 7) || !(0, HelperFunctions_1.inRange)(resPosition.y, 0, 7)) {
            return null;
        }
        return resPosition;
    }
    static onInitPosition(gameState, pos) {
        if (!(0, HelperFunctions_1.positionInGrid)(pos))
            return false;
        const piece = this.getFigure(gameState, pos);
        const pieceOnSetupBoard = Board_2.INIT_SETUP_BOARD.grid[pos.y][pos.x];
        if (!piece || !pieceOnSetupBoard)
            return false;
        return piece.getPiece() === pieceOnSetupBoard.getPiece() && piece.getColor() === pieceOnSetupBoard.getColor();
    }
    static isFirstMove(gameState, pos) {
        const piece = this.getFigure(gameState, pos);
        if (!piece)
            return false;
        const moveHistory = gameState.moveHistory;
        for (let entry of moveHistory) {
            if (piece === entry.piece) {
                return false;
            }
        }
        return true && this.onInitPosition(gameState, pos);
    }
    static getFigure(gameState, pos) {
        return gameState.board.getPiece(pos);
    }
    static getMove(start, end) {
        if (!(0, HelperFunctions_1.positionInGrid)(start) || !(0, HelperFunctions_1.positionInGrid)(end))
            throw new Error(`Any of the position are out of grid: ${start}, ${end}`);
        return {
            start: start,
            end: end,
        };
    }
    static buildHistoryEntry(gameState, move, destroyedPiece, actionType, promotionDetails) {
        const piece = this.getFigure(gameState, move.start);
        if (!piece)
            return null;
        const player = this.getPlayer(gameState, piece.getColor());
        const opponentColor = player.getColor() === 'white' ? 'black' : 'white';
        const board = new Board_1.Board();
        board.grid = Board_1.Board.cloneGrid(gameState.board.grid, false);
        const lastEntry = gameState.moveHistory.length === 0 ? undefined : gameState.moveHistory[gameState.moveHistory.length - 1];
        let historyEntry = {
            type: actionType,
            player: player,
            board: board,
            piece: piece,
            move: move,
            destroyedPiece: destroyedPiece,
            opponentKingChecked: false,
            prevDetails: {
                prevHalfMoveClock: lastEntry
                    ? gameState.halfMoveClock
                    : 0,
                prevFullMoveCounter: gameState.fullMoveCounter,
            },
            promotionDetails: { ...promotionDetails },
        };
        if (actionType === 'castling') {
            const isRightRook = this.getMoveOffset(move).x > 0 ? true : false;
            const rookPos = (0, HelperFunctions_1.parseAlgNotation)(piece.getColor() === gameState.player.getColor()
                ? isRightRook ? 'h1' : 'a1'
                : isRightRook ? 'h8' : 'a8');
            const rook = this.getFigure(gameState, rookPos);
            if (!rook)
                throw new Error('Rook not found');
            const rookMove = this.getMove(rookPos, this.getPositionRelativeTo(rookPos, 'forward', { x: isRightRook ? -2 : 3, y: 0 }));
            const castlingDetails = `${rook.getColor() === 'white' ? 'w' : 'b'}${isRightRook ? 'k' : 'q'}`;
            const castlingEntry = {
                ...historyEntry,
                rookPiece: rook,
                rookMove: rookMove,
                castlingDetails: castlingDetails,
            };
            return castlingEntry;
        }
        if (actionType === 'enPassant') {
            const moveOffset = { x: 0, y: -1 };
            const capturedPawnSquare = this.getPositionRelativeTo(move.end, this.getDirection(gameState, piece), moveOffset);
            historyEntry.enPassantCapturedSquare = capturedPawnSquare;
        }
        return historyEntry;
    }
    static getDestroyedPiece(gameState, attackerPiece, move) {
        if (!attackerPiece)
            return null;
        const player = this.getPlayer(gameState, attackerPiece.getColor());
        const pieceToBeDestroyed = this.getFigure(gameState, move.end);
        if (!pieceToBeDestroyed)
            return null;
        if (this.areAllies(attackerPiece, pieceToBeDestroyed))
            return null;
        return pieceToBeDestroyed;
    }
    /**
     * Checks if *move* is valid. Method works through searching *move* in result of *getMoves* method, therefore it's strictly **forbidden** to use in *getMoves* method and its alikes, e.g. *getPawnMoves*, *getKnightMoves*, etc
     * @param gameState
     * @param move
     * @returns
     */
    static validateMove(gameState, move) {
        const moves = this.getMoves(gameState, move.start);
        const entry = moves.find(mi => (0, HelperFunctions_1.isSameMove)(move, mi.move));
        if (!entry)
            return null;
        if (entry.type === 'castling') {
            const castlingEntry = entry;
            if (this.isValidCastlingEntry(gameState, castlingEntry)) {
                return castlingEntry;
            }
        }
        if (!this.isKingAttackedAfterMove(gameState, entry.player.getColor(), entry.move)) {
            return entry;
        }
        return null;
    }
    static isValidCastlingEntry(gameState, castlingEntry) {
        if ('castling' !== castlingEntry.type) {
            return false;
        }
        if (this.isKingChecked(gameState, castlingEntry.player.getColor())) {
            return false;
        }
        const color = castlingEntry.player.getColor();
        const rookPos = castlingEntry.rookMove.start;
        const rook = this.getFigure(gameState, rookPos);
        if (!rook || castlingEntry.rookPiece !== rook)
            return false;
        if (!this.isFirstMove(gameState, rookPos)) {
            return false;
        }
        const kingPos = castlingEntry.move.start;
        const king = this.getFigure(gameState, kingPos);
        if (!king || castlingEntry.piece !== king) {
            return false;
        }
        if (!this.isFirstMove(gameState, kingPos)) {
            return false;
        }
        const isKingSideCastling = this.getMoveOffset(castlingEntry.move).x > 0;
        let castlingPossible = true;
        if (isKingSideCastling) {
            for (let i = 1; i <= 2; i++) {
                const posOnPath = this.getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 });
                if (this.isOccupied(gameState, posOnPath) || this.isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), this.getMove(kingPos, posOnPath))) {
                    return false;
                }
            }
        }
        else {
            for (let i = -1; i >= -3; i--) {
                const posOnPath = this.getPositionRelativeTo(castlingEntry.move.start, 'forward', { x: i, y: 0 });
                if (this.isOccupied(gameState, posOnPath) || this.isKingAttackedAfterMove(gameState, castlingEntry.player.getColor(), this.getMove(kingPos, posOnPath))) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.ChessEngine = ChessEngine;
//# sourceMappingURL=ChessEngine.js.map