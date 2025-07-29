import NodeCache from "node-cache";

const CONFIG: NodeCache.Options = {
  useClones: false,
}

const LEGAL_MOVES_CACHE = new NodeCache(CONFIG);
const PSEUDO_LEGAL_MOVES_CACHE = new NodeCache(CONFIG);

function flushAllCaches(): void {
  LEGAL_MOVES_CACHE.flushAll();
  PSEUDO_LEGAL_MOVES_CACHE.flushAll();
}

export { LEGAL_MOVES_CACHE, PSEUDO_LEGAL_MOVES_CACHE, flushAllCaches };