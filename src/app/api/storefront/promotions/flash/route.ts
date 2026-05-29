import { json_ok, json_error } from "@/lib/http";
import { flash_sale_service } from "@/features/order_management_system/promotions/services/flash-sale.service";

export async function GET() {
  try {
    const data = await flash_sale_service.list_storefront();
    return json_ok({ flash_sales: data });
  } catch (e) {
    return json_error(e);
  }
}
