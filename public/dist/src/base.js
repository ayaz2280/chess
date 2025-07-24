"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChessEngine_1 = require("./ChessClass/ChessEngine");
const HelperFunctions_1 = require("./ChessClass/HelperFunctions");
const gameState = ChessEngine_1.ChessEngine.initGame('human', 'human');
const legalMoves = ChessEngine_1.ChessEngine.getLegalMoves(gameState, (0, HelperFunctions_1.parseAlgNotation)('a2'));
console.log(legalMoves);
console.log(gameState.hash);
//# sourceMappingURL=base.js.map