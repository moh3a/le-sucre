import { json_ok, json_error } from "@/lib/http";
import { product_service } from "@/features/product_information_management/products/services/product.service";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const locale = new URL(req.url).searchParams.get("locale") ?? "fr";
    const data = await product_service.get_by_slug(slug, locale);
    if (data.product.status !== "published") {
      return json_error(new Error("Produit non disponible"));
    }
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
