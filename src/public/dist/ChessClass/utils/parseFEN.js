"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFEN = parseFEN;
const chai_1 = require("chai");
const Board_1 = require("../Board/Board");
const Figure_1 = require("../Figure/Figure");
const AlgNotation_1 = require("../Moves/AlgNotation/AlgNotation");
const Player_1 = require("../Player/Player");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
const HashFunctions_1 = require("../Hashing/HashFunctions");
const gameStateUtils_1 = require("./gameStateUtils");
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
            if ((0, utils_2.isDigit)(char)) {
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
            if (!(0, utils_1.inRange)(x, 0, 8)) {
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
        enPassantTargetFile = (0, AlgNotation_1.parseAlgNotation)(enPassantStr).x;
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
    (0, HashFunctions_1.initGameStateHash)(gameState, gameState.enPassantTargetFile);
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
    if (!Object.hasOwn(gameStateUtils_1.CHAR_TO_FIGURE_MAP, f.toLowerCase())) {
        throw new Error(`Figure From Char: No figure found for char ${f}`);
    }
    const isWhite = f === f.toUpperCase();
    const color = isWhite ? 'white' : 'black';
    const figType = gameStateUtils_1.CHAR_TO_FIGURE_MAP[f.toLowerCase()];
    return new Figure_1.Figure(color, figType);
}
//# sourceMappingURL=parseFEN.js.map