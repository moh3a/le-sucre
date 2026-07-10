export const CATALOG_CACHE = {
  search: (hash: string) => `catalog:search:v1:${hash}`,
  facets: (hash: string) => `catalog:facets:v1:${hash}`,
  category_ids: (category_id: string) => `catalog:cat_ids:${category_id}`,
  fulltext: (locale: string, q: string) => `catalog:ft:v1:${locale}:${hash_query(q)}`,
  suggestions: (locale: string, q: string) => `catalog:suggestions:v1:${locale}:${hash_query(q)}`,
  trending: (locale: string) => `catalog:trending:v1:${locale}`,
} as const;

function hash_query(q: string) {
  let hash = 0;
  for (let i = 0; i < q.length; i++) {
    const char = q.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export const CATALOG_CACHE_TTL = {
  search: 120,
  facets: 180,
  category_ids: 600,
  fulltext: 60,
  suggestions: 120,
  trending: 60,
} as const;
