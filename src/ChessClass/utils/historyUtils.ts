import { Board } from "../Board/Board";
import { Figure } from "../Figure/Figure";
import { parseAlgNotation, parseMove } from "../Moves/AlgNotation/AlgNotation";
import { Player } from "../Player/Player";
import { ColorType } from "../Player/PlayerTypes";
import { ActionType, CastlingDetails, GameState, HistoryEntry, Move, Position, PromotionDetails } from "../types/ChessTypes";
import { getDirection, getPlayer } from "./gameStateUtils";
import { getMoveOffset, getMove, getPositionRelativeTo, isSameMove } from "./MoveUtils";

function buildHistoryEntry(gameState: GameState, move: Move, destroyedPiece: Figure | null, actionType: ActionType, promotionDetails: PromotionDetails): HistoryEntry | null {
    const piece: Figure | null = gameState.board.getPiece(move.start);
    // DEBUG
    if (isSameMove(move, parseMove('b4-a5'))) {
      //console.log('hey!');
    }
    //

    if (!piece) return null;

    const player: Player = getPlayer(gameState, piece.getColor());

    const opponentColor: ColorType = player.getColor() === 'white' ? 'black' : 'white';

    const board = new Board();
    board.grid = Board.cloneGrid(gameState.board.grid, false);

    const lastEntry: HistoryEntry | undefined = gameState.moveHistory.length === 0 ? undefined : gameState.moveHistory[gameState.moveHistory.length - 1];



    let historyEntry: HistoryEntry = {
      type: actionType,
      player: player,
      board: board,
      piece: piece,
      move: move,
      destroyedPiece: destroyedPiece,
      opponentKingChecked: false,
      prevDetails: {
        prevHalfMoveClock:
          lastEntry
            ? gameState.halfMoveClock
            : 0,
        prevFullMoveCounter: gameState.fullMoveCounter,
        prevChecked: structuredClone(gameState.checked),
      },
      promotionDetails: { ...promotionDetails },
    }

    if (actionType === 'castling') {
      const isRightRook: boolean = getMoveOffset(move).x > 0 ? true : false;



      const rookPos: Position = parseAlgNotation(
        piece.getColor() === gameState.player.getColor()
          ? isRightRook ? 'h1' : 'a1'
          : isRightRook ? 'h8' : 'a8'
      );

      const rook: Figure | null = board.getPiece(rookPos);


      if (!rook) throw new Error('Rook not found');

      const rookMove: Move = getMove(rookPos, getPositionRelativeTo(rookPos, 'forward', { x: isRightRook ? -2 : 3, y: 0 }) as Position);

      const castlingDetails: CastlingDetails = `${rook.getColor() === 'white' ? 'w' : 'b'}${isRightRook ? 'k' : 'q'}`;

      const castlingEntry: HistoryEntry = {
        ...historyEntry,
        rookPiece: rook,
        rookMove: rookMove,
        castlingDetails: castlingDetails,
      }

      return castlingEntry;
    }

    if (actionType === 'enPassant') {
      const moveOffset: Position = { x: 0, y: -1 };
      const capturedPawnSquare: Position = getPositionRelativeTo(move.end, getDirection(gameState, piece), moveOffset) as Position;

      historyEntry.enPassantCapturedSquare = capturedPawnSquare;
    }

    return historyEntry;
}

function isHalfMove(entry: HistoryEntry): boolean {
    if (entry.type === 'attackMove' || entry.type === 'checkmate' || entry.type === 'enPassant') {
      return false;
    }

    if (entry.piece.getPiece() === 'pawn') {
      return false;
    }
    return true;
  }

  export { buildHistoryEntry, isHalfMove }