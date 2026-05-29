import "server-only";

import { search_cache_service } from "../services/search-cache.service";

export async function invalidate_catalog_cache() {
  await search_cache_service.invalidate_all();
}

export async function invalidate_catalog_for_product() {
  await invalidate_catalog_cache();
}
