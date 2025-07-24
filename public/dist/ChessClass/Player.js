"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputerPlayer = exports.HumanPlayer = exports.Player = void 0;
class Player {
    color;
    constructor(color) {
        this.color = color;
    }
    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }
}
exports.Player = Player;
class HumanPlayer extends Player {
    playerType = 'human';
    constructor(color) {
        super(color);
    }
    suggestMove() {
        return null;
    }
}
exports.HumanPlayer = HumanPlayer;
class ComputerPlayer extends Player {
    playerType = 'ai';
    constructor(color) {
        super(color);
    }
    suggestMove() {
        return null;
    }
}
exports.ComputerPlayer = ComputerPlayer;
//# sourceMappingURL=Player.js.map