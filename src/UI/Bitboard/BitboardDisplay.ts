import { Bitboard } from "../../ChessClass/BoardBB/BitboardTypes";

function displayBitboard(bitboard: Bitboard): void {
  const segments: string[] = bitboard.toString(2).padStart(64, '0').match(/.{1,8}/g) || [];
  
  let resString: string = '';
  segments.forEach((segment, index) => {
    resString += segment.split('').join(' ') + '\n';
  });
  console.log(resString);
}

export { displayBitboard };
