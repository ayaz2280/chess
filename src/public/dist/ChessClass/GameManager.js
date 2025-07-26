"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const HelperFunctions_1 = require("./HelperFunctions");
/**
 * The goal of the *Game* class is to provide management functionality.
 */
class GameManager {
    //private gameState: GameState;
    constructor(player, opponent) {
        //this.gameState = ChessEngine.initGame(player, opponent);
    }
    static startGame() {
        this.showMenu();
    }
    // UI interaction utility functions
    // console functions
    static showMenu() {
        const gameModes = ['Player VS Player', 'Player VS Computer'];
        console.log(`${(0, HelperFunctions_1.styled)('THE CHESS GAME', 34)}`);
        console.log('');
        console.log(`${(0, HelperFunctions_1.styled)('Choose the game mode', 34)}`);
        gameModes.forEach((val, id) => {
            console.log(`${(0, HelperFunctions_1.styled)(`${id + 1}. ${val}`, 37)}`);
        });
    }
}
exports.GameManager = GameManager;
//# sourceMappingURL=GameManager.js.map