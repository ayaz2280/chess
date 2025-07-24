import { assert } from "chai";
import { Board, INIT_SETUP_BOARD } from "./Board/Board";
import { ChessEngine } from "./ChessEngine/ChessEngine";
import { Figure } from "./Figure/Figure";
import { getCastlingRightsNumbers, getFilesEnPassantNumbers, getPieceNumber, getSideToMoveNumber, getUniqueArray, inRange, isDigit, moveInGrid, parseAlgNotation, parseMove, positionInGrid, posToAlgNotation } from "./HelperFunctions";
import { HumanPlayer, ComputerPlayer } from "./Player/Player";
import { CastlingMoveInfo, CastlingRights, GameState, HistoryEntry } from "./types/ChessTypes";
import { FigureType } from "./Figure/FigureTypes";
import { Move, Position } from "./Moves/MoveTypes";
import { ColorType } from "./Player/PlayerTypes";
import { getMoveOffset, getPositionRelativeTo } from "./Moves/MoveUtils";

const CHAR_TO_FIGURE_MAP: Record<string, FigureType> = {
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
  p: 'pawn'
}

function cloneGameState(gameState: GameState): GameState {
  const newGameState: GameState = {
    player: gameState.player.playerType === 'human' ? new HumanPlayer(gameState.player.getColor()) : new ComputerPlayer(gameState.player.getColor()),

    opponent: gameState.opponent.playerType === 'human' ? new HumanPlayer(gameState.opponent.getColor()) : new ComputerPlayer(gameState.opponent.getColor()),

    board: new Board(gameState.board.grid),

    moveHistory: new Array<HistoryEntry>(...gameState.moveHistory),

    checked: {
      whiteKingChecked: gameState.checked.whiteKingChecked,
      blackKingChecked: gameState.checked.blackKingChecked,
    },
    enPassantTargetFile: gameState.enPassantTargetFile,
    castlingRights: structuredClone(gameState.castlingRights),
    halfMoveClock: gameState.halfMoveClock,
    sideToMove: gameState.sideToMove,
    fullMoveCounter: gameState.fullMoveCounter,
  }

  if (gameState.hash !== undefined) {
    newGameState.hash = gameState.hash;
  }

  return newGameState;
}

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
    gameState.hash ^= getSideToMoveNumber();
  }

  const castlingRightsNumbers: bigint[] = getCastlingRightsNumbers();

  const castlingRights: CastlingRights = requestCastlingRights(gameState);
  const castlingRightsArr: boolean[] = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];

  castlingRightsArr.forEach((castlingRight, id) => {
    if (castlingRight) {
      gameState.hash! ^= castlingRightsNumbers[id];
    }
  });

  const enPassantTargetFile: number | null = enPassantFile ?? getEnPassantFile(gameState);

  if (enPassantTargetFile) {
    gameState.hash ^= getFilesEnPassantNumbers()[enPassantTargetFile];
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
    hash ^= getSideToMoveNumber();
  }

  const castlingRightsNumbers: bigint[] = getCastlingRightsNumbers();

  const castlingRights: CastlingRights = requestCastlingRights(gameState);
  const castlingRightsArr: boolean[] = [castlingRights.white.kingSide, castlingRights.white.queenSide, castlingRights.black.kingSide, castlingRights.black.queenSide];

  castlingRightsArr.forEach((castlingRight, id) => {
    if (castlingRight) {
      hash ^= castlingRightsNumbers[id];
    }
  });

  const enPassantFile: number | null = getEnPassantFile(gameState);

  if (enPassantFile) {
    hash ^= getFilesEnPassantNumbers()[enPassantFile];
  }

  return hash;
}

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

function moveToAlgNotation(HistoryEntry: HistoryEntry): string {
  if (!moveInGrid(HistoryEntry.move)) {
    throw new Error(`Move's not in grid ${HistoryEntry.move}`);
  }
  return `${Board.getPieceString(HistoryEntry.piece)} ${posToAlgNotation(HistoryEntry.move.start)}-${posToAlgNotation(HistoryEntry.move.end)}`;
}

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
  }

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

function isSameHistoryEntry(entry1: HistoryEntry, entry2: HistoryEntry): boolean {
  let isSame: boolean = true;
  
  if (entry1.type !== entry2.type) {
    return false;
  }

  if (entry1.type === 'castling') {
    const [castlingEntry1, castlingEntry2] = [entry1 as CastlingMoveInfo, entry2 as CastlingMoveInfo];

    isSame = isSameMove(castlingEntry1.rookMove, castlingEntry2.rookMove) && 
    castlingEntry1.piece === castlingEntry2.piece;
  }

  return isSame && (entry1.player === entry2.player) && 
  (entry1.opponentKingChecked === entry2.opponentKingChecked) && 
  isSameMove(entry1.move, entry2.move) &&
  (entry1.destroyedPiece === entry2.destroyedPiece) &&
  (entry1.piece === entry2.piece);
}

function isSameMove(move1: Move, move2: Move): boolean {
    return isSamePos(move1.start, move2.start) && isSamePos(move1.end, move2.end);
  }
function isSamePos(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function getEnPassantFile(gameState: GameState): number | null {
  if (gameState.moveHistory.length === 0) return null;

  const lastEntry: HistoryEntry = gameState.moveHistory[gameState.moveHistory.length - 1];
  const moveOffset: Position = getMoveOffset(lastEntry.move);

  if (lastEntry.piece.getPiece() !== 'pawn' || !(Math.abs(moveOffset.y) === 2 && Math.abs(moveOffset.x) === 0)) {
    return null;
  }

  const file: number = lastEntry.move.end.x;

  return file;
}

function requestCastlingRights(gameState: GameState): CastlingRights {

  const whiteKingPositions: Position[] = findFigures(gameState, ['king'], 'white');
  const blackKingPositions: Position[] = findFigures(gameState, ['king'], 'black');

  if (whiteKingPositions.length !== 1 || blackKingPositions.length !== 1) {
    return {
      white: { 'kingSide': false, 'queenSide': false },
      black: { 'kingSide': false, 'queenSide': false },
    }
  }

  const whiteKingPos: Position = whiteKingPositions[0];
  const blackKingPos: Position = blackKingPositions[0];

  const castlingRights: CastlingRights = {
    white: {
      queenSide: hasCastlingRight(gameState, 'white', 'queenSide'),
      kingSide: hasCastlingRight(gameState, 'white', 'kingSide'),
    },
    black: {
      queenSide: hasCastlingRight(gameState, 'black', 'queenSide'),
      kingSide: hasCastlingRight(gameState, 'black', 'kingSide'),
    }
  }

  return castlingRights;
}

function findFigures(gameState: GameState, pieceTypes: FigureType[] | 'all', color: ColorType | 'both'): Position[] {
  const found: Position[] = [];
  const uniquePieceTypes: FigureType[] =
    pieceTypes === 'all'
      ? ['bishop', 'king', 'knight', 'pawn', 'queen', 'rook']
      : getUniqueArray(pieceTypes);

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const pos: Position = { x: x, y: y };
      const piece: Figure | null = getFigure(gameState, pos);

      if (!piece) continue;

      if ((color === 'both' || color === piece.getColor()) &&
        uniquePieceTypes.includes(piece.getPiece())) found.push(pos);
    }
  }

  return found;
}

function getFigure(gameState: GameState, pos: Position): Figure | null {
  return gameState.board.getPiece(pos);
}

/**
   * Returns whether the king of *playerColor* may castle from *side* now or in the future.
   * @param gameState 
   * @param playerColor 
   * @param side 
   * @returns 
   */
function hasCastlingRight(gameState: GameState, playerColor: ColorType, side: 'kingSide' | 'queenSide'): boolean {

  const kingPos: Position = findFigures(gameState, ['king'], playerColor)[0];

  if (!isFirstMove(gameState, kingPos)) {
    return false;
  }

  const expectedRookPos: Position = getPositionRelativeTo(kingPos, 'forward', side === 'kingSide' ? getMoveOffset(parseMove('e1-h1')) : getMoveOffset(parseMove('e1-a1'))) as Position;

  const rookPos: Position | undefined = findFigures(gameState, ['rook'], playerColor).find(pos => isSamePos(expectedRookPos, pos));

  if (!rookPos) return false;

  if (!isFirstMove(gameState, rookPos)) return false;

  return true;
}

function isFirstMove(gameState: GameState, pos: Position): boolean {
  const piece: Figure | null = getFigure(gameState, pos);

  if (!piece) return false;

  const moveHistory = gameState.moveHistory;

  for (let entry of moveHistory) {
    if (piece === entry.piece) {
      return false;
    }
  }

  return true && onInitPosition(gameState, pos);
}

function onInitPosition(gameState: GameState, pos: Position): boolean {
  if (!positionInGrid(pos)) return false;

  const piece: Figure | null = getFigure(gameState, pos);
  const pieceOnSetupBoard: Figure | null = INIT_SETUP_BOARD.grid[pos.y][pos.x];

  if (!piece || !pieceOnSetupBoard) return false;

  return piece.getPiece() === pieceOnSetupBoard.getPiece() && piece.getColor() === pieceOnSetupBoard.getColor();
}

export { initGameStateHash, cloneGameState, moveToAlgNotation, calculateHash, parseFEN, isSameMove, isSamePos, isSameHistoryEntry, getEnPassantFile, requestCastlingRights, findFigures, getFigure, isFirstMove, onInitPosition };


