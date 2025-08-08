import { HistoryEntry } from "../types/ChessTypes";

type MovesCache = Record<string, HistoryEntry[][]>;

export type { MovesCache };