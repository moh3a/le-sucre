import { json_ok, json_error } from "@/lib/http";
import { catalog_search_dto } from "@/features/product_information_management/catalog_discovery/models/search.dto";
import { search_service } from "@/features/product_information_management/catalog_discovery/services/search.service";
import { parse_catalog_search_params } from "@/features/product_information_management/catalog_discovery/helpers/catalog-url.helper";
import { RateLimitError } from "@/lib/error_handling";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/rate-limit";
import { assert_ip_not_blacklisted } from "@/lib/security/ip-blacklist";
import { sanitize_search_input, sanitize_json } from "@/lib/security/sanitization";
import {
  validate_search_query,
  search_limits,
  pagination_limits,
} from "@/lib/security/validation";

export async function GET(req: Request) {
  try {
    await assert_ip_not_blacklisted(req);

    const ip = getClientIp(req.headers);
    const rl = await rateLimit(ip, RATE_LIMITS.search);
    if (!rl.success) throw new RateLimitError();

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const sanitized_q = q ? sanitize_search_input(validate_search_query(q)) : "";

    const limit_param = url.searchParams.get("limit");
    const limit = limit_param
      ? Math.min(Number(limit_param), pagination_limits.max_per_page)
      : pagination_limits.default_per_page;

    const sp = sanitize_json(Object.fromEntries(url.searchParams.entries()));
    const parsed = parse_catalog_search_params(sp);

    const input = catalog_search_dto.parse({
      ...parsed,
      locale: url.searchParams.get("locale") ?? "fr",
      q: sanitized_q || undefined,
      category_id: url.searchParams.get("category_id") ?? undefined,
      category_slug: url.searchParams.get("category_slug") ?? undefined,
      limit,
    });

    const result = await search_service.search(input);
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}
