import seedrandom, { PRNG } from 'seedrandom';

const ZOBRIST_SEED = "8(800)-555-35-35_Better_call_HERE";

const rng: PRNG = seedrandom(ZOBRIST_SEED);

function generate64BitRandomNumber(): bigint {
  const high: number = Math.floor(rng() * 0x100000000);
  const low: number = Math.floor(rng() * 0x100000000);

  return (BigInt(high) << 32n) | BigInt(low);
}

export { generate64BitRandomNumber };