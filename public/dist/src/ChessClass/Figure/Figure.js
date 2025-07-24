"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Figure = void 0;
class Figure {
    color;
    piece;
    constructor(color, piece) {
        this.color = color;
        this.piece = piece;
    }
    getColor() {
        return this.color;
    }
    getPiece() {
        return this.piece;
    }
    setColor(color) {
        this.color = color;
    }
    setPiece(piece) {
        this.piece = piece;
    }
    static clone(piece) {
        return new Figure(piece.color, piece.piece);
    }
}
exports.Figure = Figure;
//# sourceMappingURL=Figure.js.map