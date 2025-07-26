"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate64BitRandomNumber = generate64BitRandomNumber;
const seedrandom_1 = __importDefault(require("seedrandom"));
const ZOBRIST_SEED = "8(800)-555-35-35_Better_call_HERE";
const rng = (0, seedrandom_1.default)(ZOBRIST_SEED);
function generate64BitRandomNumber() {
    const high = Math.floor(rng() * 0x100000000);
    const low = Math.floor(rng() * 0x100000000);
    return (BigInt(high) << 32n) | BigInt(low);
}
//# sourceMappingURL=Random.js.map