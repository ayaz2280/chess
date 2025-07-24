import { Emitter } from "event-emitter";
import { ChessEngine } from "./ChessEngine/ChessEngine";
import { styled } from "./HelperFunctions";
import { GameState } from "./types/ChessTypes";
import { PlayerType } from "./Player/PlayerTypes";
import { EventEmitter } from 'events';
/**
 * The goal of the *Game* class is to provide management functionality.
 */
export class GameManager{
  //private gameState: GameState;


  constructor(player: PlayerType, opponent: PlayerType) {
    //this.gameState = ChessEngine.initGame(player, opponent);
  }

  static startGame(): void {
    this.showMenu();
  }

  // UI interaction utility functions

  // console functions
  static showMenu(): void {
    const gameModes: string[] = ['Player VS Player', 'Player VS Computer'];

    console.log(`${styled('THE CHESS GAME', 34)}`);
    console.log('');

    console.log(`${styled('Choose the game mode', 34)}`);
    
    gameModes.forEach((val, id) => {
      console.log(
        `${styled(`${id+1}. ${val}`, 37)}`
      );
    });
  }
}