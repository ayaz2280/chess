import { assert } from "console";
import { Bitboard } from "../../BoardBB/BitboardTypes";
import { promises } from 'fs';
import { displayBitboard } from "../../../UI/Bitboard/BitboardDisplay";
import path from 'path';


function writeMasks(pathString: string, masks: Bitboard[]): Promise<void> {
  const masksArr: BigUint64Array = new BigUint64Array(masks);

  return promises.writeFile(pathString, masksArr) 
  .then(() => {
    console.log(`Successfully written ${masksArr.byteLength} bytes to file ${pathString}`);
  })
}

function readMasks(path: string): Promise<Bitboard[]> {
  return promises.readFile(path)
  .then(fileBuffer => {
    const masksArr: BigUint64Array = new BigUint64Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.length / 8);
    const masks: Bitboard[] = Array.from(masksArr);

    if (masks.length !== 64) {
      throw new RangeError(`Number of masks isn't equal 64. Got ${masks.length}`);
    }

    console.log(`Successfully read ${masksArr.length} bytes from file ${path}`);
    
    return masks;
  })
}

export { writeMasks, readMasks };