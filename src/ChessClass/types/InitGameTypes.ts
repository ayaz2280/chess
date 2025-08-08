import { ChessGrid } from "../Board/BoardTypes"
import { ColorType } from "../Player/PlayerTypes"
import { PlayerDetails } from "./ChessTypes"

type InitGameInfo = {
  playerDetails: PlayerDetails, 
  boardSetup?: ChessGrid | 'emptyBoard', 
  sideToMove?: ColorType
}

export type { InitGameInfo }