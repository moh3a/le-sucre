import { json_ok, json_error } from "@/lib/http";
import { product_service } from "@/features/product_information_management/products/services/product.service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const result = await product_service.list({
      page: Number(url.searchParams.get("page") ?? 1),
      limit: Number(url.searchParams.get("limit") ?? 20),
      status: "published",
      category_id: url.searchParams.get("category_id") ?? undefined,
      brand_id: url.searchParams.get("brand_id") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
    });
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}
