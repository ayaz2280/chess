import { Bitboard } from "../../BoardBB/BitboardTypes";
import fs from 'fs';

async function writeMasks(path: string, masks: Bitboard[]) {
  const masksArr: BigInt64Array = new BigInt64Array(masks);

  const openPromise: Promise<number> = 
    new Promise((resolve, reject) => {
      fs.open(path, fs.constants.O_CREAT | fs.constants.O_WRONLY, (err, fd) => {
      if (err) {
        reject(`Error opening the file '${path}': ${err}`);
      } else {
        console.log(`File opened: ${fd}`);
        resolve(fd);
      }
    });
  });

  openPromise
    .then((fd) => {
      fs.write(fd, masksArr, 0, masksArr.length, 0, (err, written, buffer) => {
        if (err) {
          throw new Error(`Error writing to file '${path}'`, err);
        }

        console.log(`Successfully written ${written} bytes to file ${path}`);
        });
      });

}

async function readMasks(path: string, masksBuff: Bitboard[]) {
  if (masksBuff.length !== 0) {
    throw new Error(`masksBuff.length must equal to 0, got ${masksBuff.length}`);
  }

  await fs.open(path, fs.constants.O_RDONLY, (err, fd) => {
    if (err) {
      return console.error(`Error opening the file '${path}'`, err);
    }
    console.log(`File opened: ${fd}`);

    const masksArr: BigInt64Array = new BigInt64Array(masksBuff.length);

    fs.read(fd, masksArr, 0, masksArr.length, 0, (err, bytesRead, buffer) => {
      if (err) {
        return console.error(`Error reading from file '${path}'`, err);
      }

      console.log(`Successfully read ${bytesRead} bytes from file ${path}`);
      masksBuff.push(...Array.from(masksArr));
    });
  });
}

export { writeMasks, readMasks };