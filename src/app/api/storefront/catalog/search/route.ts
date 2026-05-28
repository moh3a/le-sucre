import { json_ok, json_error } from "@/lib/http";
import { catalog_search_dto } from "@/features/catalog_discovery/models/search.dto";
import { search_service } from "@/features/catalog_discovery/services/search.service";
import { parse_catalog_search_params } from "@/features/catalog_discovery/helpers/catalog-url.helper";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sp = Object.fromEntries(url.searchParams.entries());
    const parsed = parse_catalog_search_params(sp);

    const input = catalog_search_dto.parse({
      locale: url.searchParams.get("locale") ?? "fr",
      category_id: url.searchParams.get("category_id") ?? undefined,
      category_slug: url.searchParams.get("category_slug") ?? undefined,
      ...parsed,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const result = await search_service.search(input);
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}
