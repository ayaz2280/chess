"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChessEngine_1 = require("./ChessClass/ChessEngine/ChessEngine");
const HelperFunctions_1 = require("./ChessClass/HelperFunctions");
const gameState = ChessEngine_1.ChessEngine.initGame({ player: 'human', opponent: 'human' });
gameState.board.display();
const moves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, (0, HelperFunctions_1.parseAlgNotation)('a2'));
console.log(...moves.map(e => e.move));
console.log('hello world, bitch!');
//# sourceMappingURL=base.js.map