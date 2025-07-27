import { assert } from "chai";
import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";

import { parseAlgNotation } from "../Moves/AlgNotation/AlgNotation";
import { HumanPlayer } from "../Player/Player";
import { ColorType } from "../Player/PlayerTypes";
import { GameState, CastlingRights } from "../types/ChessTypes";
import { inRange } from "./utils";
import { isDigit } from "./utils";
import { FigureType } from "../Figure/FigureTypes";
import { initGameStateHash } from "../Hashing/HashFunctions";
import { CHAR_TO_FIGURE_MAP } from "./gameStateUtils";

function parseFEN(fen: string): GameState {
  const board = new Board();


  const params: string[] = fen.split(' ');

  if (params.length !== 6) {
    throw new Error(`Parsing FEN Error: Expected 6 params in FEN string, got ${params.length}`);
  }

  // piece placement
  const piecesPlacement: string[] = params[0].split('/');
  if (piecesPlacement.length !== 8) {
    throw new Error(`Parsing FEN Error: Pieces Placement: Expected 8 rows, got ${piecesPlacement.length}`);
  }

  piecesPlacement.forEach((row, id) => {
    if (row.length > 8) {
      throw new Error(`Parsing FEN Error: Pieces Placement: Expected row ${id} to be less or equal to the length of 8, got ${row.length}`);
    }

    const y: number = 7 - id;

    const rowArr: string[] = row.split('');
    let x: number = 0;
    let fig: Figure;

    rowArr.forEach((char) => {
      if (isDigit(char)) {
        x += +char;
      } else {
        try {
          fig = getFigureFromChar(char);
        } catch (err: unknown) {
          assert(err instanceof Error);
          throw new Error(`Parsing FEN Error: Row ${id}: ${err.message}`);
        }
        board!.place(fig, { x: x, y: y });
        x += 1;
      }

      if (!inRange(x, 0, 8)) {
        throw new Error(`Parsing FEN Error: Row ${id} with length >= ${x} exceeds the required length of 8`);
      }

    });
  });

  // side to move
  const sideToMoveParam: string = params[1];
  if (!(/^(b|w)$/gm.test(sideToMoveParam))) {
    throw new Error(`Parsing FEN Error: Side To Move: Expected to be 'b' or 'w', got: ${sideToMoveParam}`);
  }

  const sideToMove: ColorType = sideToMoveParam === 'w' ? 'white' : 'black';

  // castling rights
  const castlingRightsStr: string = params[2];
  if (
    !(/^[KQkq]{1,4}$|^-$/gm.test(castlingRightsStr))
  ) {
    throw new Error(`Parsing FEN Error: Castling Rights: Wrong Castling Rights String: ${castlingRightsStr}`);
  }

  const castlingRightsArr: string[] = castlingRightsStr.split('');

  if (castlingRightsArr.length !== new Set(castlingRightsArr).size) {
    throw new Error(`Parsing FEN Error: Castling Rights: Contains Duplicates: ${castlingRightsStr}`);
  }

  const castlingRights: CastlingRights = buildCastlingRights(castlingRightsStr);

  // en passant target file
  const enPassantStr: string = params[3];
  if (!(/^[abcdefgh][36]$|^-$/gm.test(enPassantStr))) {
    throw new Error(`Parsing FEN Error: En Passant Target File: Expected to get a string '[a-h][36] or '-', got: ${enPassantStr}`);
  }

  let enPassantTargetFile: number | null = null;
  if (enPassantStr === '-') enPassantTargetFile = null;
  else {
    enPassantTargetFile = parseAlgNotation(enPassantStr).x;
  }

  // half move clock
  const halfMoveClock: number = parseInt(params[4]);

  if (isNaN(halfMoveClock) || halfMoveClock < 0) {
    throw new Error(`Parsing FEN Error: Half Move Clock: Expected to get a number greater or equal to 0, got: ${params[4]}`);
  }

  // full move counter
  const fullMoveCounter: number = parseInt(params[5]);

  if (isNaN(fullMoveCounter) || fullMoveCounter < 1) {
    throw new Error(`Parsing FEN Error: Full Move Counter: Expected to get a number greater or equal to 1, got: ${params[5]}`);
  }

  const gameState: GameState = {
    player: new HumanPlayer('white'),
    opponent: new HumanPlayer('black'),
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
function buildCastlingRights(cr: string): CastlingRights {
  const castlingRights: CastlingRights = {
    white: {
      queenSide: false,
      kingSide: false,
    },
    black: {
      queenSide: false,
      kingSide: false,
    }
  };

  if (cr === '-') return castlingRights;

  const crArr: string[] = cr.split('');
  crArr.forEach(val => {
    let color: ColorType;

    if (val === val.toUpperCase()) {
      color = 'white';
    } else {
      color = 'black';
    }

    let side: 'queenSide' | 'kingSide';
    if (val.toLowerCase() === 'k') {
      side = 'kingSide';
    } else {
      side = 'queenSide';
    }

    castlingRights[color][side] = true;
  });

  return castlingRights;
}
function getFigureFromChar(f: string): Figure {
  if (f.length !== 1) {
    throw new Error(`Figure From Char: Expected ${f} to be of length 1, got ${f.length}`);
  }
  if (!Object.hasOwn(CHAR_TO_FIGURE_MAP, f.toLowerCase())) {
    throw new Error(`Figure From Char: No figure found for char ${f}`);
  }
  const isWhite: boolean = f === f.toUpperCase();
  const color: ColorType = isWhite ? 'white' : 'black';
  const figType: FigureType = CHAR_TO_FIGURE_MAP[f.toLowerCase()];

  return new Figure(color, figType);
}

export { parseFEN };
