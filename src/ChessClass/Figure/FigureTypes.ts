
export type FigureType = 'pawn' | 'king' | 'bishop' | 'queen' | 'rook' | 'knight';

export type SlidingFigureType = Exclude<FigureType, 'pawn' | 'knight' | 'king'>;
