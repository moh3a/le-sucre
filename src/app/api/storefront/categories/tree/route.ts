import { json_ok, json_error } from "@/lib/http";
import { category_service } from "@/features/product_information_management/categories/services/category.service";

export async function GET() {
  try {
    const tree = await category_service.get_full_tree(true);
    return json_ok(tree);
  } catch (e) {
    return json_error(e);
  }
}
