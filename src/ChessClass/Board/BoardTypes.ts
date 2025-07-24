import { Figure } from "../Figure/Figure";

type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

type Tuple8<T> = Tuple<T, 8>;

type ChessGrid = Tuple8<Tuple8<Figure | null>>;

export type { Tuple, ChessGrid };
