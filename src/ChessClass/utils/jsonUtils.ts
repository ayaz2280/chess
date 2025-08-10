import { assert } from "chai";
import { GameState, HistoryEntry, LegalMovesMap } from "../types/ChessTypes";
import fs from 'fs';
import NodeCache from "node-cache";
import { extractCache, LEGAL_MOVES_CACHE, PSEUDO_LEGAL_MOVES_CACHE } from "../Cache/Cache";

function saveGameStateToJson(gameState: GameState, filename: string = 'C:/apps/Chess2/tmp/gameState.json'): void {
  try {

    const jsonString: string = 
    JSON.stringify(
      gameState, 
      (key, value) => {
        if (key === 'hash') {
          return value.toString();
        }
        return value;
      },  
    2);


    fs.writeFileSync(filename, jsonString, 'utf-8');
    console.log(`Game state successfully saved to ${filename}`);
  } catch (error: any) {
    assert(error instanceof Error);
    console.log(`Error saving game state to ${filename}:`, error);
  }
}

function saveMoveCacheToJson(cache: NodeCache, file: string = 'C:/apps/Chess2/tmp/moves.json') {
  try {
    assert(cache === LEGAL_MOVES_CACHE || cache === PSEUDO_LEGAL_MOVES_CACHE);
    
    const cacheObj = extractCache(cache);

    const jsonCache: string = JSON.stringify(cacheObj, undefined, 2);

    fs.writeFileSync(file, jsonCache, 'utf-8');
    console.log('Cache data was successfully saved!');
  } catch (err: any) {
    assert(err instanceof Error);
    console.log(`Couldn't write data to file ${file}: `, err);
  }
  


}

function saveLegalMovesMapToJson(legalMovesMap: LegalMovesMap, file: string = 'C:/apps/Chess2/tmp/legalMovesMap.json') {
  try {
    const jsonCache: string = JSON.stringify(legalMovesMap, undefined, 2);

    fs.writeFileSync(file, jsonCache, 'utf-8');
    console.log('Legal moves map was successfully saved!');
  } catch (err: any) {
    assert(err instanceof Error);
    console.log(`Couldn't write data to file ${file}: `, err);
  }
}

export { saveGameStateToJson, saveMoveCacheToJson, saveLegalMovesMapToJson };