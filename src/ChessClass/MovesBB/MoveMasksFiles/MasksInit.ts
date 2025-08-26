import { Bitboard } from "../../BoardBB/BitboardTypes";
import { readMasks } from "./MoveMasksFilesFunctions";

export const MOVE_MASKS_BASE_DIR: string = 'C:/Users/ffajl/OneDrive/Документы/GitHub/untitled8/chess/src/ChessClass/MovesBB/MoveMasksFiles';

export async function loadMasks(filePath: string, buff: Bitboard[]) {
  try {
    const buffer: Bitboard[] = await readMasks(filePath);
    buff.push(...buffer);
  } catch (err: any) {
    console.error('Error fetching masks', err);
  }
}