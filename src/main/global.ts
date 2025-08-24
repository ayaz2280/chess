import { Bitboard } from "../ChessClass/BoardBB/BitboardTypes";
import { displayBitboard } from "../UI/Bitboard/BitboardDisplay";

declare global {
  function displayBitboard(bitboard: Bitboard): void;
}

global.displayBitboard = displayBitboard;