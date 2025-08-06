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

function extractCache(cache: NodeCache): Record<string, any> {
  const keys: string[] = cache.keys();

  const cacheObj: Record<string, any> = {};
  keys.forEach(key => {
    cacheObj[key] = cache.get(key);
  })

  return cacheObj;
}

export { LEGAL_MOVES_CACHE, PSEUDO_LEGAL_MOVES_CACHE, flushAllCaches, extractCache };