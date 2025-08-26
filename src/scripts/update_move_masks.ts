import { Bitboard, EnumPiece } from "../ChessClass/BoardBB/BitboardTypes";
import { BISHOP_MOVE_MASKS, calculateBishopMoveMasks } from "../ChessClass/MovesBB/MoveMasksGenerators/BishopMoveMasks";
import { calculateKingMoveMasks, KING_MOVE_MASKS } from "../ChessClass/MovesBB/MoveMasksGenerators/KingMoveMasks";
import { calculateKnightMoveMasks, KNIGHT_MOVE_MASKS } from "../ChessClass/MovesBB/MoveMasksGenerators/KnightMoveMasks";
import { calculatePawnAttackMasks, calculatePawnPushMasks, PAWN_ATTACK_MASKS, PAWN_EN_PASSANT_FILE_MASKS, PAWN_PUSH_MASKS } from "../ChessClass/MovesBB/MoveMasksGenerators/PawnMoveMasks";
import { calculateQueenMoveMasks, QUEEN_MOVE_MASKS } from "../ChessClass/MovesBB/MoveMasksGenerators/QueenMoveMasks";
import { calculateRookMoveMasks, ROOK_MOVE_MASKS } from "../ChessClass/MovesBB/MoveMasksGenerators/RookMoveMasks";
import { writeMasks } from "../ChessClass/MovesBB/MoveMasksFiles/MoveMasksFilesFunctions";
import path from "path";
import { promises } from "fs";

const BASE_PATH: string = `C:/Users/ffajl/OneDrive/Документы/GitHub/untitled8/chess/src/ChessClass/MovesBB/MoveMasksFiles`;

const pieceMaskMap: Record<string, Record<string, Bitboard[]>> = {
  'pawn': {
    'move': PAWN_PUSH_MASKS,
    'attack': PAWN_ATTACK_MASKS,
    'en_passant': PAWN_EN_PASSANT_FILE_MASKS,
  },
  'bishop': {
    'move': BISHOP_MOVE_MASKS,
  },
  'knight': {
    'move': KNIGHT_MOVE_MASKS,
  },
  'rook': {
    'move': ROOK_MOVE_MASKS,
  },
  'queen': {
    'move': QUEEN_MOVE_MASKS,
  },
  'king': {
    'move': KING_MOVE_MASKS
  }
}

function recalculateMasks(): void {
  calculateBishopMoveMasks();
  calculateKingMoveMasks();
  calculateKnightMoveMasks();
  calculatePawnAttackMasks();
  calculatePawnPushMasks();
  calculateQueenMoveMasks();
  calculateRookMoveMasks();
}

async function updateMaskFiles(): Promise<void> {
  recalculateMasks();

  for (let piece in pieceMaskMap) {
    const dirName: string = `${piece.charAt(0).toUpperCase().concat(piece.substring(1))}MasksFiles`;

    for (let moveMaskType in pieceMaskMap[piece]) {
      const fileName: string = `${piece}_${moveMaskType}_masks`;


      try {
        const filePath: string = path.join(BASE_PATH,dirName,fileName);

        await promises.mkdir(path.join(BASE_PATH, dirName), {recursive: true});

        await writeMasks(filePath, pieceMaskMap[piece][moveMaskType]);
      } catch (err: any) {
        console.error(`Couldn't write data to file`, err);
        return;
      };
      console.log(`Generated ${piece} masks at location`);
    }
  }
}

updateMaskFiles();