type Bitboard = bigint;

enum EnumPiece {
    White,
    Black,
    Pawn,
    Knight,
    Bishop,
    Queen,
    King,
    Rook
}

export type { Bitboard };
export { EnumPiece };