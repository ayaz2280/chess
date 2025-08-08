import { ActionType, GameState, HistoryEntry, Move } from '../../src/ChessClass/types/ChessTypes';
import { ChessEngine } from '../../src/ChessClass/ChessEngine/ChessEngine';
import { extractCache, flushAllCaches, LEGAL_MOVES_CACHE } from '../../src/ChessClass/Cache/Cache';
import { moveToAlgNotation, parseMove } from '../../src/ChessClass/Moves/AlgNotation/AlgNotation';
import { expect } from 'chai';
import fs from 'fs';
import { saveGameStateToJson, saveMoveCacheToJson } from '../../src/ChessClass/utils/jsonUtils';
import { FigureType } from '../../src/ChessClass/Figure/FigureTypes';
import { isSameMove } from '../../src/ChessClass/utils/MoveUtils';
import { parseFEN } from '../../src/ChessClass/utils/parseFEN';

//const delay = ms => new Promise(res => setTimeout(res, ms)); 

function filterExistingMoves(cacheObj: Record<string, HistoryEntry[]>): void {
  for (let key in cacheObj) {
    if (cacheObj[key].length === 0) {
      delete cacheObj[key];
    }
  }
}

type EssentialEntryInfo = {
  pieceType: FigureType,
  move: Move,
  type: ActionType,
}

function areEntriesInCache(flatCachedEntries: HistoryEntry[], flatExpectedEntries: EssentialEntryInfo[]): boolean {
  
  for (const expEntry of flatExpectedEntries) {
    const found: HistoryEntry | undefined = flatCachedEntries.find(e => {
      return isSameMove(e.move, expEntry.move) &&
        expEntry.pieceType === e.piece.getPiece() &&
        expEntry.type === e.type;
    });

    if (!found) {
      console.log(expEntry);
      return false;
    }
  }

  return true;
}

describe('updateLegalMoves()', () => {
  let gameState: GameState;
  let cacheObj: Record<string, HistoryEntry[]>;

  beforeEach(() => {
    flushAllCaches();
  });

  it('should store all legal moves in cache for all figures on game initialization', () => {
    gameState = ChessEngine.initGame({playerDetails: {player: 'human', opponent: 'human'}});
    cacheObj = extractCache(LEGAL_MOVES_CACHE);

    //await delay(1000);
    filterExistingMoves(cacheObj);
    //saveMoveCacheToJson(LEGAL_MOVES_CACHE);

    expect(Object.values(cacheObj)).to.have.lengthOf(10);
    
    const expectedEntries: EssentialEntryInfo[] = [

    ];
    const expectedMoves: Move[] = [
      parseMove('a2-a3'),
      parseMove('a2-a4'),
      parseMove('b2-b3'),
      parseMove('b2-b4'),
      parseMove('c2-c3'),
      parseMove('c2-c4'),
      parseMove('d2-d3'),
      parseMove('d2-d4'),
      parseMove('e2-e3'),
      parseMove('e2-e4'),
      parseMove('f2-f3'),
      parseMove('f2-f4'),
      parseMove('g2-g3'),
      parseMove('g2-g4'),
      parseMove('h2-h3'),
      parseMove('h2-h4'),
      parseMove('b1-a3'),
      parseMove('b1-c3'),
      parseMove('g1-f3'),
      parseMove('g1-h3'),
    ]
    
    expectedMoves.forEach((move, i) => {
      expectedEntries.push({ pieceType: i < 16 ? 'pawn' : 'knight', move: move, type: 'move' });
    })

    const res: boolean = areEntriesInCache(Object.values(cacheObj).flat(), expectedEntries);

    expect(res).to.be.true;

  });

  it('should store only legal moves to resolve king check', () => {
    const fen: string = '4k3/8/8/8/8/8/5N2/4K2r w - - 0 1';
    gameState = parseFEN(fen);
    saveGameStateToJson(gameState);

    cacheObj = extractCache(LEGAL_MOVES_CACHE);
    
    filterExistingMoves(cacheObj);

    saveMoveCacheToJson(LEGAL_MOVES_CACHE);

    const expectedMoves: Move[] = [
      parseMove('e1-d1'),
      parseMove('e1-d2'),
      parseMove('e1-e2'),
      parseMove('e1-f1'),
      parseMove('f2-h1'),
    ]

    const expectedEntries: EssentialEntryInfo[] = expectedMoves.map((move, id) => {
      return {
        pieceType: id !== (expectedMoves.length - 1) ? 'king' : 'knight',
        move: move, 
        type: id !== (expectedMoves.length - 1) ? 'move' : 'attackMove',
      }
    })

    const res: boolean = areEntriesInCache(Object.values(cacheObj).flat(), expectedEntries);

    expect(res).to.be.true;
  })

  it.only('should store only legal king moves when he is in double check', () => {
    const fen: string = '4k3/8/2B2N1r/8/8/2r5/8/4K3 b - - 0 1';
    gameState = parseFEN(fen);
    saveGameStateToJson(gameState);

    cacheObj = extractCache(LEGAL_MOVES_CACHE);
    
    filterExistingMoves(cacheObj);

    saveMoveCacheToJson(LEGAL_MOVES_CACHE);

    const expectedMoves: Move[] = [
      parseMove('e8-d8'),
      parseMove('e8-e7'),
      parseMove('e8-f7'),
      parseMove('e8-f8'),
    ]

    const expectedEntries: EssentialEntryInfo[] = expectedMoves.map((move, id) => {
      return {
        pieceType: 'king',
        move: move, 
        type: 'move',
      }
    })

    const res: boolean = areEntriesInCache(Object.values(cacheObj).flat(), expectedEntries);

    expect(res).to.be.true;
  });
});