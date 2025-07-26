"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGameStateHash = initGameStateHash;
exports.cloneGameState = cloneGameState;
exports.moveToAlgNotation = moveToAlgNotation;
exports.calculateHash = calculateHash;
exports.parseFEN = parseFEN;
exports.isSameMove = isSameMove;
exports.isSamePos = isSamePos;
exports.isSameHistoryEntry = isSameHistoryEntry;
exports.getEnPassantFile = getEnPassantFile;
exports.requestCastlingRights = requestCastlingRights;
exports.findFigures = findFigures;
exports.getFigure = getFigure;
exports.isFirstMove = isFirstMove;
exports.onInitPosition = onInitPosition;
const chai_1 = require("chai");
const Board_1 = require("./Board/Board");
const Figure_1 = require("./Figure/Figure");
const HelperFunctions_1 = require("./HelperFunctions");
const Player_1 = require("./Player/Player");
const MoveUtils_1 = require("./utils/MoveUtils");
const CHAR_TO_FIGURE_MAP = {
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
    p: 'pawn'
};
function cloneGameState(gameState) {
    const newGameState = {
        player: gameState.player.playerType === 'human' ? new Player_1.HumanPlayer(gameState.player.getColor()) : new Player_1.ComputerPlayer(gameState.player.getColor()),
        opponent: gameState.opponent.playerType === 'human' ? new Player_1.HumanPlayer(gameState.opponent.getColor()) : new Player_1.ComputerPlayer(gameState.opponent.getColor()),
        board: new Board_1.Board(gameState.board.grid),
        moveHistory: new Array(...gameState.moveHistory),
        checked: {
            whiteKingChecked: gameState.checked.whiteKingChecked,
            blackKingChecked: gameState.checked.blackKingChecked,
        },
        enPassantTargetFile: gameState.enPassantTargetFile,
        castlingRights: structuredClone(gameState.castlingRights),
        halfMoveClock: gameState.halfMoveClock,
        sideToMove: gameState.sideToMove,
        fullMoveCounter: gameState.fullMoveCounter,
    };
    if (gameState.hash !== undefined) {
        newGameState.hash = gameState.hash;
    }
    return newGameState;
}
function initGameStateHash(gameState, enPassantFile) {
    if (gameState.hash) {
        return gameState.hash;
    }
    gameState.hash = 0n;
    const board = gameState.board;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pos = { x: x, y: y };
            const piece = board.getPiece(pos);
            if (!piece)
                continue;
            gameState.hash ^= (0, HelperFunctions_1.getPieceNumber)(piece.getColor(), piece.getPiece(), pos);
        }
    }
    // the side to move is black
    if (gameState.sideToMove === 'black') {
        gameState.hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
    }
    const castlingRightsNumbers = (0, HelperFunctions_1.getCastlingRightsNumbers)();
    const castlingRights = requestCastlingRights(gameState);
    const castlingRightsArr = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];
    castlingRightsArr.forEach((castlingRight, id) => {
        if (castlingRight) {
            gameState.hash ^= castlingRightsNumbers[id];
        }
    });
    const enPassantTargetFile = enPassantFile ?? getEnPassantFile(gameState);
    if (enPassantTargetFile) {
        gameState.hash ^= (0, HelperFunctions_1.getFilesEnPassantNumbers)()[enPassantTargetFile];
    }
    return gameState.hash;
}
function calculateHash(gameState) {
    let hash = 0n;
    const board = gameState.board;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pos = { x: x, y: y };
            const piece = board.getPiece(pos);
            if (!piece)
                continue;
            hash ^= (0, HelperFunctions_1.getPieceNumber)(piece.getColor(), piece.getPiece(), pos);
        }
    }
    // the side to move is black
    if (gameState.moveHistory.length !== 0 && gameState.moveHistory[gameState.moveHistory.length - 1].player.getColor() === 'white') {
        hash ^= (0, HelperFunctions_1.getSideToMoveNumber)();
    }
    const castlingRightsNumbers = (0, HelperFunctions_1.getCastlingRightsNumbers)();
    const castlingRights = requestCastlingRights(gameState);
    const castlingRightsArr = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];
    castlingRightsArr.forEach((castlingRight, id) => {
        if (castlingRight) {
            hash ^= castlingRightsNumbers[id];
        }
    });
    const enPassantFile = getEnPassantFile(gameState);
    if (enPassantFile) {
        hash ^= (0, HelperFunctions_1.getFilesEnPassantNumbers)()[enPassantFile];
    }
    return hash;
}
function recalculateHash(gameState, newEntry) {
    if (!gameState.hash) {
        gameState.hash = initGameStateHash(gameState);
    }
    const move = newEntry.move;
    const board = gameState.board;
    const pieceOnStart = board.getPiece(move.start);
    if (pieceOnStart === null) {
        throw new Error(`Error Hashing: no figure on start pos { x: ${move.start}, y: ${move.end.y}}`);
    }
    const movingPieceNum = (0, HelperFunctions_1.getPieceNumber)(pieceOnStart.getColor(), pieceOnStart.getPiece(), move.start);
    return gameState.hash;
}
function moveToAlgNotation(HistoryEntry) {
    if (!(0, HelperFunctions_1.moveInGrid)(HistoryEntry.move)) {
        throw new Error(`Move's not in grid ${HistoryEntry.move}`);
    }
    return `${Board_1.Board.getPieceString(HistoryEntry.piece)} ${(0, HelperFunctions_1.posToAlgNotation)(HistoryEntry.move.start)}-${(0, HelperFunctions_1.posToAlgNotation)(HistoryEntry.move.end)}`;
}
function parseFEN(fen) {
    const board = new Board_1.Board();
    const params = fen.split(' ');
    if (params.length !== 6) {
        throw new Error(`Parsing FEN Error: Expected 6 params in FEN string, got ${params.length}`);
    }
    // piece placement
    const piecesPlacement = params[0].split('/');
    if (piecesPlacement.length !== 8) {
        throw new Error(`Parsing FEN Error: Pieces Placement: Expected 8 rows, got ${piecesPlacement.length}`);
    }
    piecesPlacement.forEach((row, id) => {
        if (row.length > 8) {
            throw new Error(`Parsing FEN Error: Pieces Placement: Expected row ${id} to be less or equal to the length of 8, got ${row.length}`);
        }
        const y = 7 - id;
        const rowArr = row.split('');
        let x = 0;
        let fig;
        rowArr.forEach((char) => {
            if ((0, HelperFunctions_1.isDigit)(char)) {
                x += +char;
            }
            else {
                try {
                    fig = getFigureFromChar(char);
                }
                catch (err) {
                    (0, chai_1.assert)(err instanceof Error);
                    throw new Error(`Parsing FEN Error: Row ${id}: ${err.message}`);
                }
                board.place(fig, { x: x, y: y });
                x += 1;
            }
            if (!(0, HelperFunctions_1.inRange)(x, 0, 8)) {
                throw new Error(`Parsing FEN Error: Row ${id} with length >= ${x} exceeds the required length of 8`);
            }
        });
    });
    // side to move
    const sideToMoveParam = params[1];
    if (!(/^(b|w)$/gm.test(sideToMoveParam))) {
        throw new Error(`Parsing FEN Error: Side To Move: Expected to be 'b' or 'w', got: ${sideToMoveParam}`);
    }
    const sideToMove = sideToMoveParam === 'w' ? 'white' : 'black';
    // castling rights
    const castlingRightsStr = params[2];
    if (!(/^[KQkq]{1,4}$|^-$/gm.test(castlingRightsStr))) {
        throw new Error(`Parsing FEN Error: Castling Rights: Wrong Castling Rights String: ${castlingRightsStr}`);
    }
    const castlingRightsArr = castlingRightsStr.split('');
    if (castlingRightsArr.length !== new Set(castlingRightsArr).size) {
        throw new Error(`Parsing FEN Error: Castling Rights: Contains Duplicates: ${castlingRightsStr}`);
    }
    const castlingRights = buildCastlingRights(castlingRightsStr);
    // en passant target file
    const enPassantStr = params[3];
    if (!(/^[abcdefgh][36]$|^-$/gm.test(enPassantStr))) {
        throw new Error(`Parsing FEN Error: En Passant Target File: Expected to get a string '[a-h][36] or '-', got: ${enPassantStr}`);
    }
    let enPassantTargetFile = null;
    if (enPassantStr === '-')
        enPassantTargetFile = null;
    else {
        enPassantTargetFile = (0, HelperFunctions_1.parseAlgNotation)(enPassantStr).x;
    }
    // half move clock
    const halfMoveClock = parseInt(params[4]);
    if (isNaN(halfMoveClock) || halfMoveClock < 0) {
        throw new Error(`Parsing FEN Error: Half Move Clock: Expected to get a number greater or equal to 0, got: ${params[4]}`);
    }
    // full move counter
    const fullMoveCounter = parseInt(params[5]);
    if (isNaN(fullMoveCounter) || fullMoveCounter < 1) {
        throw new Error(`Parsing FEN Error: Full Move Counter: Expected to get a number greater or equal to 1, got: ${params[5]}`);
    }
    const gameState = {
        player: new Player_1.HumanPlayer('white'),
        opponent: new Player_1.HumanPlayer('black'),
        board: board,
        moveHistory: [],
        sideToMove: sideToMove,
        checked: {
            whiteKingChecked: false,
            blackKingChecked: false,
        },
        castlingRights: castlingRights,
        enPassantTargetFile: enPassantTargetFile,
        halfMoveClock: halfMoveClock,
        fullMoveCounter: fullMoveCounter,
    };
    initGameStateHash(gameState, gameState.enPassantTargetFile);
    return gameState;
}
function buildCastlingRights(cr) {
    const castlingRights = {
        white: {
            queenSide: false,
            kingSide: false,
        },
        black: {
            queenSide: false,
            kingSide: false,
        }
    };
    if (cr === '-')
        return castlingRights;
    const crArr = cr.split('');
    crArr.forEach(val => {
        let color;
        if (val === val.toUpperCase()) {
            color = 'white';
        }
        else {
            color = 'black';
        }
        let side;
        if (val.toLowerCase() === 'k') {
            side = 'kingSide';
        }
        else {
            side = 'queenSide';
        }
        castlingRights[color][side] = true;
    });
    return castlingRights;
}
function getFigureFromChar(f) {
    if (f.length !== 1) {
        throw new Error(`Figure From Char: Expected ${f} to be of length 1, got ${f.length}`);
    }
    if (!Object.hasOwn(CHAR_TO_FIGURE_MAP, f.toLowerCase())) {
        throw new Error(`Figure From Char: No figure found for char ${f}`);
    }
    const isWhite = f === f.toUpperCase();
    const color = isWhite ? 'white' : 'black';
    const figType = CHAR_TO_FIGURE_MAP[f.toLowerCase()];
    return new Figure_1.Figure(color, figType);
}
function isSameHistoryEntry(entry1, entry2) {
    let isSame = true;
    if (entry1.type !== entry2.type) {
        return false;
    }
    if (entry1.type === 'castling') {
        const [castlingEntry1, castlingEntry2] = [entry1, entry2];
        isSame = isSameMove(castlingEntry1.rookMove, castlingEntry2.rookMove) &&
            castlingEntry1.piece === castlingEntry2.piece;
    }
    return isSame && (entry1.player === entry2.player) &&
        (entry1.opponentKingChecked === entry2.opponentKingChecked) &&
        isSameMove(entry1.move, entry2.move) &&
        (entry1.destroyedPiece === entry2.destroyedPiece) &&
        (entry1.piece === entry2.piece);
}
function isSameMove(move1, move2) {
    return isSamePos(move1.start, move2.start) && isSamePos(move1.end, move2.end);
}
function isSamePos(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}
function getEnPassantFile(gameState) {
    if (gameState.moveHistory.length === 0)
        return null;
    const lastEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
    const moveOffset = (0, MoveUtils_1.getMoveOffset)(lastEntry.move);
    if (lastEntry.piece.getPiece() !== 'pawn' || !(Math.abs(moveOffset.y) === 2 && Math.abs(moveOffset.x) === 0)) {
        return null;
    }
    const file = lastEntry.move.end.x;
    return file;
}
function requestCastlingRights(gameState) {
    const whiteKingPositions = findFigures(gameState, ['king'], 'white');
    const blackKingPositions = findFigures(gameState, ['king'], 'black');
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
            queenSide: hasCastlingRight(gameState, 'white', 'queenSide'),
            kingSide: hasCastlingRight(gameState, 'white', 'kingSide'),
        },
        black: {
            queenSide: hasCastlingRight(gameState, 'black', 'queenSide'),
            kingSide: hasCastlingRight(gameState, 'black', 'kingSide'),
        }
    };
    return castlingRights;
}
function findFigures(gameState, pieceTypes, color) {
    const found = [];
    const uniquePieceTypes = pieceTypes === 'all'
        ? ['bishop', 'king', 'knight', 'pawn', 'queen', 'rook']
        : (0, HelperFunctions_1.getUniqueArray)(pieceTypes);
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const pos = { x: x, y: y };
            const piece = getFigure(gameState, pos);
            if (!piece)
                continue;
            if ((color === 'both' || color === piece.getColor()) &&
                uniquePieceTypes.includes(piece.getPiece()))
                found.push(pos);
        }
    }
    return found;
}
function getFigure(gameState, pos) {
    return gameState.board.getPiece(pos);
}
/**
   * Returns whether the king of *playerColor* may castle from *side* now or in the future.
   * @param gameState
   * @param playerColor
   * @param side
   * @returns
   */
function hasCastlingRight(gameState, playerColor, side) {
    const kingPos = findFigures(gameState, ['king'], playerColor)[0];
    if (!isFirstMove(gameState, kingPos)) {
        return false;
    }
    const expectedRookPos = (0, MoveUtils_1.getPositionRelativeTo)(kingPos, 'forward', side === 'kingSide' ? (0, MoveUtils_1.getMoveOffset)((0, HelperFunctions_1.parseMove)('e1-h1')) : (0, MoveUtils_1.getMoveOffset)((0, HelperFunctions_1.parseMove)('e1-a1')));
    const rookPos = findFigures(gameState, ['rook'], playerColor).find(pos => isSamePos(expectedRookPos, pos));
    if (!rookPos)
        return false;
    if (!isFirstMove(gameState, rookPos))
        return false;
    return true;
}
function isFirstMove(gameState, pos) {
    const piece = getFigure(gameState, pos);
    if (!piece)
        return false;
    const moveHistory = gameState.moveHistory;
    for (let entry of moveHistory) {
        if (piece === entry.piece) {
            return false;
        }
    }
    return true && onInitPosition(gameState, pos);
}
function onInitPosition(gameState, pos) {
    if (!(0, HelperFunctions_1.positionInGrid)(pos))
        return false;
    const piece = getFigure(gameState, pos);
    const pieceOnSetupBoard = Board_1.INIT_SETUP_BOARD.grid[pos.y][pos.x];
    if (!piece || !pieceOnSetupBoard)
        return false;
    return piece.getPiece() === pieceOnSetupBoard.getPiece() && piece.getColor() === pieceOnSetupBoard.getColor();
}
//# sourceMappingURL=GameStateHelperFunctions.js.map