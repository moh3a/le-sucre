import "server-only";
import { recommendation_cache_service } from "../services/recommendation-cache.service";

export async function invalidate_recommendations_for_product(product_id: string) {
  await recommendation_cache_service.invalidate_product(product_id);
}

export async function invalidate_all_recommendations() {
  await recommendation_cache_service.invalidate_all();
}
