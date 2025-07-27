import { Figure } from "../Figure/Figure";
import { getUniqueArray, styled } from "../utils/utils";
import { positionInGrid } from "../utils/boardUtils";
import type { ChessGrid } from "./BoardTypes";
import type { FigureType } from "../Figure/FigureTypes";
import type { Move, Position } from "../Moves/MoveTypes";
import { ColorType } from "../Player/PlayerTypes";

class Board {
  grid: ChessGrid;

  constructor(grid?: ChessGrid) {
    if (grid) {
      this.grid = Board.cloneGrid(grid, false);
    } else {
      this.grid = Board.initEmptyGrid(); 
    }
  }

  static initEmptyGrid(): ChessGrid {
    const grid: null[][] = [[],[],[],[],[],[],[],[]];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        grid[y].push(null);
      }
    }

    return grid as ChessGrid;
  }

  static cloneGrid(grid: ChessGrid, cloneFigures: boolean) {
    const newGrid: ChessGrid = this.initEmptyGrid();

    for (let y = 0; y <= 7; y++) {
      for (let x = 0; x <= 7; x++) {
        if (grid[y][x]) {
          newGrid[y][x] = 
            cloneFigures 
            ? Figure.clone(grid[y][x] as Figure)
            : grid[y][x]
        }
      }
    }

    return newGrid;
  }

  move(move: Move): boolean {
    if (!positionInGrid(move.start) || !positionInGrid(move.end)) {
      throw new Error(`Move is out of grid`);
    }

    if (!this.grid[move.start.y][move.start.x]) {
      return false;
    }
    [this.grid[move.end.y][move.end.x], this.grid[move.start.y][move.start.x]] = [this.grid[move.start.y][move.start.x], null];
    return true;
  } 

  display(emptyCellDisplay?: string, cellSeparator?: string, showDimensions?: boolean, dimensionColorCode?: number) {
    const emptyCell: string = emptyCellDisplay ?? '_';
    const separator: string = cellSeparator ?? ' ';
    const showDimension: boolean = showDimensions ?? true;
    const dimensionColor: number = dimensionColorCode ?? 34;

    for (let y = 7; y >= 0; y--) {
      let row: string = `${styled(`${y+1}`, dimensionColor)}${separator}${Board.getRowString(this.grid[y], separator, emptyCell)}`;
      console.log(row);
    }

    if (showDimension) {
      const letters: string[] = [`${separator}`, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      letters.forEach((val, id) => {
        letters[id] = styled(val, dimensionColor);
      });
      console.log(letters.join(separator));
    }
  }

  private static getRowString(row: (Figure | null)[], separator: string, nullPlaceholder: string) {
    let res: string = '';

    for (const cell of row) {
      if (cell) {
        res += this.getPieceString(cell);
      } else {
        res += nullPlaceholder;
      }
      res += ' ';
    }

    return res;
  }

  public static getPieceString(piece: Figure): string {
    const pieceName: string = piece.getPiece() === 'knight' ? 'N' 
    : piece.getPiece().charAt(0).toUpperCase();
    
    const colorCode: number = piece.getColor() === 'white' ? 37 : 30;

    return styled(pieceName, colorCode);
  }

  place(piece: Figure, coord: Position): Figure | null {
    if (!positionInGrid(coord)) {
      throw new Error(`Position {x: ${coord.x}, y: ${coord.y}} is out of grid`);
    }

    const pieceOnSquare: Figure | null = this.removePiece(coord); 

    this.grid[coord.y][coord.x] = piece;
    return pieceOnSquare;
  }

  removePiece(pos: Position): Figure | null {
    if (!positionInGrid(pos)) return null;

    let piece: Figure | null = this.grid[pos.y][pos.x];

    this.grid[pos.y][pos.x] = null;

    return piece;
  }

  getPiece(pos: Position): Figure | null {
    if (!positionInGrid(pos)) return null;
    return this.grid[pos.y][pos.x];
  }

  isOccupied(pos: Position): boolean {
    return this.grid[pos.y][pos.x] ? true : false;
  }

  findFigures(pieceTypes: FigureType[] | 'all', color: ColorType | 'both'): Position[] {
    const found: Position[] = [];
    const uniquePieceTypes: FigureType[] =
      pieceTypes === 'all'
        ? ['bishop', 'king', 'knight', 'pawn', 'queen', 'rook']
        : getUniqueArray(pieceTypes);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pos: Position = { x: x, y: y };
        const piece: Figure | null = this.getPiece(pos);

        if (!piece) continue;

        if ((color === 'both' || color === piece.getColor()) &&
          uniquePieceTypes.includes(piece.getPiece())) found.push(pos);
      }
    }

    return found;
  }
}

export function getInitialBoard(): Board {
    const BOARD_LOCAL = new Board();

    const secondRow: FigureType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for (let x = 0; x <= 7; x++) {
        BOARD_LOCAL.place(new Figure('white', 'pawn'), {x: x, y: 1});
        BOARD_LOCAL.place(new Figure('white', secondRow[x]), {x: x, y: 0});

        BOARD_LOCAL.place(new Figure('black', 'pawn'), {x: x, y: 6});
        BOARD_LOCAL.place(new Figure('black', secondRow[x]), {x: x, y: 7});
    }
    return BOARD_LOCAL;
}


const INIT_SETUP_BOARD = getInitialBoard();

export { Board, INIT_SETUP_BOARD };