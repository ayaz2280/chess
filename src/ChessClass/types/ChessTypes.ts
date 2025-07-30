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
  prevChecked: KingsChecked,
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

type CheckingPieceDetail = {
  piece: Figure,
  pos: Position,
}

type CheckInfo = {
  checkingPieces: CheckingPieceDetail[],
}

type KingCheckStatus = 'NOT_CHECKED' | 'SINGLE_CHECK' | 'DOUBLE_CHECK';

type StatusCheckInfo = {
  status: KingCheckStatus,
  checkingPieces: CheckingPieceDetail[],
}

type KingsChecked = {
  whiteKingChecked: CheckInfo,
  blackKingChecked: CheckInfo,
}

type GameState = {
  player: Player;
  opponent: Player;
  board: Board;
  moveHistory: HistoryEntry[];
  sideToMove: ColorType,
  checked: KingsChecked,
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



export type { Position, PlayerType, GameState, Move, BaseMoveInfo, CastlingMoveInfo, HistoryEntry, ActionType, CastlingRights, CastlingDetails, PromotionDetails, PlayerDetails, KingsChecked, CheckInfo, CheckingPieceDetail, StatusCheckInfo, KingCheckStatus};
