"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Board_1 = require("../../public/dist/ChessClass/Board");
const Figure_1 = require("../../src/ChessClass/Figure/Figure");
const HelperFunctions_1 = require("../../src/ChessClass/HelperFunctions");
describe('Board', () => {
    let board;
    let piece;
    it("new Board() creates a new 8x8 empty array with each element equals 'null'", () => {
        board = new Board_1.Board();
        (0, chai_1.expect)(board).to.have.property('grid').with.lengthOf(8);
        const allSubarraysAreValid = board.grid.every(subarr => {
            (0, chai_1.expect)(subarr).to.have.lengthOf(8);
            subarr.every(val => chai_1.assert.equal(val, null));
        });
    });
    it("new Board(grid) creates a new board with a deepclone of grid", () => {
        const initGrid = [[], [], [], [], [], [], [], []];
        initGrid.forEach((subArr, id) => {
            for (let x = 0; x < 8; x++) {
                initGrid[id].push(new Figure_1.Figure('black', 'king'));
            }
        });
        board = new Board_1.Board(initGrid);
        (0, chai_1.expect)(board).to.have.property('grid').with.lengthOf(8);
        const allSubarraysAreValid = board.grid.every((subarr, y) => {
            (0, chai_1.expect)(subarr).to.have.lengthOf(8);
            subarr.every((val, x) => (0, chai_1.expect)(val).to.deep.equal(initGrid[y][x]) && (0, chai_1.expect)(val).to.not.equal(initGrid[y][x]));
        });
    });
    describe('Pieces Manipulation', () => {
        beforeEach(() => {
            board = new Board_1.Board();
            piece = new Figure_1.Figure('white', 'pawn');
        });
        describe('Place', () => {
            beforeEach(() => {
                board = new Board_1.Board();
            });
            it('The pawn is placed at A2', () => {
                board.place(piece, (0, HelperFunctions_1.parseAlgNotation)('a2'));
                chai_1.assert.equal(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('a2')), piece);
            });
            it('The pawn is placed at H8', () => {
                board.place(piece, (0, HelperFunctions_1.parseAlgNotation)('h8'));
                chai_1.assert.equal(board.getPiece((0, HelperFunctions_1.parseAlgNotation)('h8')), piece);
            });
            it('Throws an error when placed out of grid', () => {
                const posOutOfGrid = { x: 10, y: 10 };
                (0, chai_1.expect)(() => { board.place(piece, posOutOfGrid); }).to.throw();
            });
        });
        describe('Move', () => {
            beforeEach(() => {
                board = new Board_1.Board();
                board.place(piece, (0, HelperFunctions_1.parseAlgNotation)('a2'));
            });
            it('Piece is landed on D2', () => {
                const move = (0, HelperFunctions_1.parseMove)('a2-d2');
                board.move(move);
                chai_1.assert.equal(piece, board.getPiece((0, HelperFunctions_1.parseAlgNotation)('d2')));
            });
            it("Throws an error if Move is out of grid", () => {
                const illegalMove = {
                    start: {
                        x: 200,
                        y: 200,
                    },
                    end: {
                        x: 5000,
                        y: -5000,
                    }
                };
                (0, chai_1.expect)(() => { board.move(illegalMove); }).to.throw();
            });
        });
    });
});
//# sourceMappingURL=Board.test.js.map