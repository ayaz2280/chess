import { assert } from "chai";
import { Board } from "../src/ChessClass/Board/Board";
import { ChessEngine } from "../src/ChessClass/ChessEngine/ChessEngine";

import { HumanPlayer, ComputerPlayer } from "../src/ChessClass/Player/Player";
import { ChessGrid } from "../src/ChessClass/Board/BoardTypes";
import { posToAlgNotation } from "../src/ChessClass/Moves/AlgNotation/AlgNotation";
import { Position } from "../src/ChessClass/Moves/MoveTypes";
import { ColorType } from "../src/ChessClass/Player/PlayerTypes";
import { GameState, HistoryEntry } from "../src/ChessClass/types/ChessTypes";
import { requestCastlingRights, getEnPassantFile } from "../src/ChessClass/utils/evalGameStateUtils";
import { styled } from "../src/ChessClass/utils/utils";


 const printEntries = (entries: HistoryEntry[]): void => {
  entries.forEach((e, id) => {
    console.log(`#${id} Entry`);
    console.log(`\ttype: ${styled(e.type, 32)}`);
    console.log(`\tplayer: ${styled(e.player.getColor(), 32)}`);
    console.log(`\tpiece: ${styled(e.piece.getColor(), 32)}, ${styled(e.piece.getPiece(), 32)}`);
    console.log(`\tmove: ${styled(posToAlgNotation(e.move.start), 32)}${styled('-', 32)}${styled(posToAlgNotation(e.move.end), 32)}`);
    console.log(`\tdestroyedPiece: ${styled(e.destroyedPiece ? `${e.destroyedPiece.getColor()}, ${e.destroyedPiece.getPiece()}` : 'null', 32)}`);
  })
} 

export {printEntries};