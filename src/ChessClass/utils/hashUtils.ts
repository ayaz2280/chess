import { ActionType, GameState, HistoryEntry, Position } from "../types/ChessTypes";

function getKey(...args: string[]): string {
  return args.join(':');
}

function getMovesKey(moveCategory: 'legal_moves' | 'pseudo_legal_moves', gameState: GameState, position: Position, types?: ActionType[]): string {
  const typesKey: string = types ? types.join('_') : 'all';

  const key: string = getKey(moveCategory, gameState.hash.toString(), `x${position.x}`,`y${position.y}`, typesKey);

  return key;
}



export { getKey, getMovesKey };