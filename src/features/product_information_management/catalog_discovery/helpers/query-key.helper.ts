import { createHash } from "node:crypto";
import type { CatalogSearchInput } from "../models/search.dto";

export function stable_catalog_hash(input: unknown) {
  const raw = JSON.stringify(input, Object.keys(input as object).sort());
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export function catalog_search_cache_payload(input: CatalogSearchInput) {
  const { page, limit, sort, ...rest } = input;
  return { filters: rest, page, limit, sort };
}
