import { json_ok, json_error } from "@/lib/http";
import { promotion_repository } from "@/features/order_management_system/promotions/repositories/promotion.repository";

export async function GET() {
  try {
    const data = await promotion_repository.list_active_automatic(null);
    return json_ok({ promotions: data });
  } catch (e) {
    return json_error(e);
  }
}
