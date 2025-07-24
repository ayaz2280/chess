import { assert, expect, use } from 'chai';
import { ChessEngine } from '../../src/ChessClass/ChessEngine';
import { GameState } from '../../src/ChessClass/types/ChessTypes';
import { parseFEN } from '../../src/ChessClass/GameStateHelperFunctions';
import { parseMove } from '../../src/ChessClass/HelperFunctions';
import chaiExclude from 'chai-exclude';

use(chaiExclude);

function testEqualityGameStates(gameState1: GameState, gameState2: GameState): void {

}

describe('parseFEN', () => {
  let gameState: GameState;
  
  it('should create gamestate for starting positions', () => {
    const fenString: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    gameState = parseFEN(fenString);

    const expectedGameState: GameState = ChessEngine.initGame({player: 'human', opponent: 'human'});

    expect(gameState).to.deep.equal(expectedGameState);
  });
  
  it('should create correct gamestate for one pawn move', () => {
    const fenString: string = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

    gameState = parseFEN(fenString);

    const expectedGameState: GameState = ChessEngine.initGame({player: 'human', opponent: 'human'});

    ChessEngine.applyMoveDebug(expectedGameState, parseMove('e2-e4'));

    expect(gameState).excluding('moveHistory').to.deep.equal(expectedGameState);
  });

  it('should create correct gamestate for one full move', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2';

    gameState = parseFEN(fenString);

    const expectedGameState: GameState = ChessEngine.initGame({player: 'human', opponent: 'human'});

    ChessEngine.applyMoveDebug(expectedGameState, parseMove('e2-e4'));
    ChessEngine.applyMoveDebug(expectedGameState, parseMove('c7-c5'));

    expect(gameState).excluding('moveHistory').to.deep.equal(expectedGameState);
  });

  it('should create correct gamestate for 3 moves', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    gameState = parseFEN(fenString);

    const expectedGameState: GameState = ChessEngine.initGame({player: 'human', opponent: 'human'});

    ChessEngine.applyMoveDebug(expectedGameState, parseMove('e2-e4'));
    ChessEngine.applyMoveDebug(expectedGameState, parseMove('c7-c5'));
    ChessEngine.applyMoveDebug(expectedGameState, parseMove('g1-f3'));

    expect(gameState).excluding('moveHistory').to.deep.equal(expectedGameState);
  });

  it('should throw error on wrong number of rows', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    let success: boolean = true;
    let errMsg: string = '';
    const expectedError: RegExp = /Parsing FEN Error: Pieces Placement: Expected 8 rows, got 7/;

    try {
      parseFEN(fenString);
    } catch (err) {
      errMsg = err;
      success = false;
    }

    expect(success).to.be.false;
    expect(errMsg).to.match(expectedError);
  });

  it('should throw error on wrong number of args', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2 3';

    let success: boolean = true;
    let errMsg: string = '';
    const expectedError: RegExp = /Parsing FEN Error: Expected 6 params in FEN string, got 7/;

    try {
      parseFEN(fenString);
    } catch (err) {
      errMsg = err;
      success = false;
    }

    expect(success).to.be.false;
    expect(errMsg).to.match(expectedError);
  });

  it('should throw an error on the wrong piece in the last row', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/ANBQKB1R b KQkq - 1 2';

    let success: boolean = true;
    let errMsg: string = '';
    const expectedError: RegExp = /Parsing FEN Error: Row 7/;

    try {
      parseFEN(fenString);
    } catch (err) {
      errMsg = err;
      success = false;
    }

    expect(success).to.be.false;
    expect(errMsg).to.match(expectedError);
  });
  
  it('should throw an error on the wrong length of the row', () => {
    const fenString: string = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/6N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';

    let success: boolean = true;
    let errMsg: string = '';
    const expectedError: RegExp = /Parsing FEN Error: Row 5 with length >= 9 exceeds the required length of 8/;
    
    try {
      parseFEN(fenString);
    } catch (err: unknown) {
      assert(err instanceof Error);
      errMsg = err.message;
      success = false;
    }
    
    expect(success).to.be.false;
    expect(errMsg).to.match(expectedError);
  });

  
  
});