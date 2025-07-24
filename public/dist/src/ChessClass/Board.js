"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIT_SETUP_BOARD = exports.Board = void 0;
exports.getInitialBoard = getInitialBoard;
const Figure_1 = require("./Figure/Figure");
const HelperFunctions_1 = require("./HelperFunctions");
class Board {
    grid;
    constructor(grid) {
        if (grid) {
            this.grid = Board.cloneGrid(grid, false);
        }
        else {
            this.grid = Board.initEmptyGrid();
        }
    }
    static initEmptyGrid() {
        const grid = [[], [], [], [], [], [], [], []];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                grid[y].push(null);
            }
        }
        return grid;
    }
    static cloneGrid(grid, cloneFigures) {
        const newGrid = this.initEmptyGrid();
        for (let y = 0; y <= 7; y++) {
            for (let x = 0; x <= 7; x++) {
                if (grid[y][x]) {
                    newGrid[y][x] =
                        cloneFigures
                            ? Figure_1.Figure.clone(grid[y][x])
                            : grid[y][x];
                }
            }
        }
        return newGrid;
    }
    move(move) {
        if (!(0, HelperFunctions_1.positionInGrid)(move.start) || !(0, HelperFunctions_1.positionInGrid)(move.end)) {
            throw new Error(`Move is out of grid`);
        }
        if (!this.grid[move.start.y][move.start.x]) {
            return false;
        }
        [this.grid[move.end.y][move.end.x], this.grid[move.start.y][move.start.x]] = [this.grid[move.start.y][move.start.x], null];
        return true;
    }
    display(emptyCellDisplay, cellSeparator, showDimensions, dimensionColorCode) {
        const emptyCell = emptyCellDisplay ?? '_';
        const separator = cellSeparator ?? ' ';
        const showDimension = showDimensions ?? true;
        const dimensionColor = dimensionColorCode ?? 34;
        for (let y = 7; y >= 0; y--) {
            let row = `${(0, HelperFunctions_1.styled)(`${y + 1}`, dimensionColor)}${separator}${Board.getRowString(this.grid[y], separator, emptyCell)}`;
            console.log(row);
        }
        if (showDimension) {
            const letters = [`${separator}`, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            letters.forEach((val, id) => {
                letters[id] = (0, HelperFunctions_1.styled)(val, dimensionColor);
            });
            console.log(letters.join(separator));
        }
    }
    static getRowString(row, separator, nullPlaceholder) {
        let res = '';
        for (const cell of row) {
            if (cell) {
                res += this.getPieceString(cell);
            }
            else {
                res += nullPlaceholder;
            }
            res += ' ';
        }
        return res;
    }
    static getPieceString(piece) {
        const pieceName = piece.getPiece() === 'knight' ? 'N'
            : piece.getPiece().charAt(0).toUpperCase();
        const colorCode = piece.getColor() === 'white' ? 37 : 30;
        return (0, HelperFunctions_1.styled)(pieceName, colorCode);
    }
    place(piece, coord) {
        if (!(0, HelperFunctions_1.positionInGrid)(coord)) {
            throw new Error(`Position {x: ${coord.x}, y: ${coord.y}} is out of grid`);
        }
        const pieceOnSquare = this.removePiece(coord);
        this.grid[coord.y][coord.x] = piece;
        return pieceOnSquare;
    }
    removePiece(pos) {
        if (!(0, HelperFunctions_1.positionInGrid)(pos))
            return null;
        let piece = this.grid[pos.y][pos.x];
        this.grid[pos.y][pos.x] = null;
        return piece;
    }
    getPiece(pos) {
        if (!(0, HelperFunctions_1.positionInGrid)(pos))
            return null;
        return this.grid[pos.y][pos.x];
    }
}
exports.Board = Board;
function getInitialBoard() {
    const BOARD_LOCAL = new Board();
    const secondRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let x = 0; x <= 7; x++) {
        BOARD_LOCAL.place(new Figure_1.Figure('white', 'pawn'), { x: x, y: 1 });
        BOARD_LOCAL.place(new Figure_1.Figure('white', secondRow[x]), { x: x, y: 0 });
        BOARD_LOCAL.place(new Figure_1.Figure('black', 'pawn'), { x: x, y: 6 });
        BOARD_LOCAL.place(new Figure_1.Figure('black', secondRow[x]), { x: x, y: 7 });
    }
    return BOARD_LOCAL;
}
const INIT_SETUP_BOARD = getInitialBoard();
exports.INIT_SETUP_BOARD = INIT_SETUP_BOARD;
//# sourceMappingURL=Board.js.map