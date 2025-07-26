"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSEUDO_LEGAL_MOVES_CACHE = exports.LEGAL_MOVES_CACHE = void 0;
exports.flushAllCaches = flushAllCaches;
const node_cache_1 = __importDefault(require("node-cache"));
const CONFIG = {
    useClones: false,
};
const LEGAL_MOVES_CACHE = new node_cache_1.default(CONFIG);
exports.LEGAL_MOVES_CACHE = LEGAL_MOVES_CACHE;
const PSEUDO_LEGAL_MOVES_CACHE = new node_cache_1.default(CONFIG);
exports.PSEUDO_LEGAL_MOVES_CACHE = PSEUDO_LEGAL_MOVES_CACHE;
function flushAllCaches() {
    LEGAL_MOVES_CACHE.flushAll();
    PSEUDO_LEGAL_MOVES_CACHE.flushAll();
}
//# sourceMappingURL=Cache.js.map