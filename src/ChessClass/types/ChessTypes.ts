import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { FigureType } from "../Figure/FigureTypes";
import { Player } from "../Player/Player";
import { ColorType, PlayerType } from "../Player/PlayerTypes";
import { Move, Position } from "../Moves/MoveTypes";

type ActionType = 'move' | 'attackMove' | 'checkmate' | 'stalemate' | 'castling' | 'enPassant';

type PreviousDetails = {
  prevHalfMoveClock: number,
  prevFullMoveCounter: number,
}

type PromotionDetails = {
  isPromotion: boolean,
  promotedTo?: Exclude<FigureType, 'king' | 'pawn'>,
}

type BaseMoveInfo = {
  type: ActionType,
  player: Player,
  board: Board,
  piece: Figure,
  move: Move,
  destroyedPiece: Figure | null,
  opponentKingChecked: boolean,
  enPassantCapturedSquare?: Position,
  promotionDetails: PromotionDetails,
  prevDetails: PreviousDetails,
}

type CastlingDetails = 'wk' | 'wq' | 'bk' | 'bq';

type CastlingMoveInfo = BaseMoveInfo & {
  type: 'castling',
  castlingDetails: CastlingDetails,
  rookPiece: Figure,
  rookMove: Move,
}


type OnePlayerCastlingRights = {
  queenSide: boolean,
  kingSide: boolean,
}

type CastlingRights = {
  white: OnePlayerCastlingRights,
  black: OnePlayerCastlingRights,
}

type HistoryEntry = BaseMoveInfo | CastlingMoveInfo;

type GameState = {
  player: Player;
  opponent: Player;
  board: Board;
  moveHistory: HistoryEntry[];
  sideToMove: ColorType,
  checked: {
    whiteKingChecked: boolean,
    blackKingChecked: boolean,
  }
  hash: bigint,
  castlingRights: CastlingRights,
  enPassantTargetFile: number | null,
  halfMoveClock: number,
  fullMoveCounter: number,
}

type PlayerDetails = {
  player: PlayerType,
  opponent: PlayerType,
}



export type { Position, PlayerType, GameState, Move, BaseMoveInfo, CastlingMoveInfo, HistoryEntry, ActionType, CastlingRights, CastlingDetails, PromotionDetails, PlayerDetails};