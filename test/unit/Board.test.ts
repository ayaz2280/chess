import { assert, expect } from "chai";
import { Board } from "../../public/dist/ChessClass/Board";
import { ChessGrid, Move, Position } from "../../src/ChessClass/types/ChessTypes";
import { Figure } from "../../src/ChessClass/Figure/Figure";
import { parseAlgNotation, parseMove } from "../../src/ChessClass/HelperFunctions";

describe('Board', () => {
  let board: Board;
  let piece: Figure;

  it("new Board() creates a new 8x8 empty array with each element equals 'null'", () => {
    board = new Board();

    expect(board).to.have.property('grid').with.lengthOf(8);

    const allSubarraysAreValid = board.grid.every(subarr => {
      expect(subarr).to.have.lengthOf(8);

      subarr.every(val => assert.equal(val, null));
    })
  });

  it("new Board(grid) creates a new board with a deepclone of grid", () => {
    const initGrid: any = [[],[],[],[],[],[],[],[]];

    initGrid.forEach((subArr, id) => {
      for (let x = 0; x < 8; x++) {
        initGrid[id].push(new Figure('black', 'king'));
      }
    });

    board = new Board(initGrid as ChessGrid);

    expect(board).to.have.property('grid').with.lengthOf(8);

    const allSubarraysAreValid = board.grid.every((subarr,y) => {
      expect(subarr).to.have.lengthOf(8);

      subarr.every((val,x) => expect(val).to.deep.equal(initGrid[y][x]) && expect(val).to.not.equal(initGrid[y][x]));
    })
  })

  describe('Pieces Manipulation', () => {
    beforeEach(() => {
      board = new Board();
      piece = new Figure('white', 'pawn')
    });

    describe('Place', () => {
      beforeEach(() => {
        board = new Board();
      });

      it('The pawn is placed at A2', () => {
        board.place(piece, parseAlgNotation('a2'));

        assert.equal(board.getPiece(parseAlgNotation('a2')), piece);
      });

      it('The pawn is placed at H8', () => {
        board.place(piece, parseAlgNotation('h8'));

        assert.equal(board.getPiece(parseAlgNotation('h8')), piece);
      });

      it('Throws an error when placed out of grid', () => {
        const posOutOfGrid: Position = {x: 10, y:10};
        expect(() => { board.place(piece, posOutOfGrid)}).to.throw();
      })
    });

    describe('Move', () => {
      beforeEach(() => {
        board = new Board();
        board.place(piece, parseAlgNotation('a2'));
      })

      it('Piece is landed on D2', () => {
        const move: Move = parseMove('a2-d2');
        board.move(move);
        assert.equal(piece, board.getPiece(parseAlgNotation('d2')));
      }); 

      it("Throws an error if Move is out of grid", () => {
        const illegalMove: Move = {
          start: {
            x: 200,
            y: 200,
          },
          end: {
            x: 5000,
            y: -5000,
          }
        }

        expect(() => { board.move(illegalMove); }).to.throw();
      })
    });
  });
});