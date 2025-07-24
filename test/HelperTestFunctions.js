"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printEntries = exports.createTestGameState = void 0;
const Board_1 = require("../src/ChessClass/Board");
const ChessEngine_1 = require("../src/ChessClass/ChessEngine");
const HelperFunctions_1 = require("../src/ChessClass/HelperFunctions");
const Player_1 = require("../src/ChessClass/Player");
const createTestGameState = (boardGrid, currentPlayerColor = 'white') => {
    const board = new Board_1.Board();
    if (boardGrid) {
        board.grid = boardGrid; // Directly set grid for specific scenarios
    }
    else {
        // Default empty board or initial setup
        ChessEngine_1.ChessEngine.setupBoard(board); // Use actual setup for realism
    }
    return {
        player: currentPlayerColor === 'white' ? new Player_1.HumanPlayer('white') : new Player_1.ComputerPlayer('white'),
        opponent: currentPlayerColor === 'white' ? new Player_1.ComputerPlayer('black') : new Player_1.HumanPlayer('black'),
        board: board,
        moveHistory: [],
        checked: {
            whiteKingChecked: false,
            blackKingChecked: false,
        }
    };
};
exports.createTestGameState = createTestGameState;
const printEntries = (entries) => {
    entries.forEach((e, id) => {
        console.log(`#${id} Entry`);
        console.log(`\ttype: ${(0, HelperFunctions_1.styled)(e.type, 32)}`);
        console.log(`\tplayer: ${(0, HelperFunctions_1.styled)(e.player.getColor(), 32)}`);
        console.log(`\tpiece: ${(0, HelperFunctions_1.styled)(e.piece.getColor(), 32)}, ${(0, HelperFunctions_1.styled)(e.piece.getPiece(), 32)}`);
        console.log(`\tmove: ${(0, HelperFunctions_1.styled)((0, HelperFunctions_1.posToAlgNotation)(e.move.start), 32)}${(0, HelperFunctions_1.styled)('-', 32)}${(0, HelperFunctions_1.styled)((0, HelperFunctions_1.posToAlgNotation)(e.move.end), 32)}`);
        console.log(`\tdestroyedPiece: ${(0, HelperFunctions_1.styled)(e.destroyedPiece ? `${e.destroyedPiece.getColor()}, ${e.destroyedPiece.getPiece()}` : 'null', 32)}`);
    });
};
exports.printEntries = printEntries;
//# sourceMappingURL=HelperTestFunctions.js.map