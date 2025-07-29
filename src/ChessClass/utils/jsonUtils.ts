import { assert } from "chai";
import { GameState } from "../types/ChessTypes";
import fs from 'fs';

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

export { saveGameStateToJson };