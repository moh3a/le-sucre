import { json_ok, json_error } from "@/lib/http";
import { promotion_service } from "@/features/order_management_system/promotions/services/promotion.service";
import {
  create_promotion_dto,
  list_promotions_dto,
} from "@/features/order_management_system/promotions/models/promotion.dto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = list_promotions_dto.safeParse({
      page: url.searchParams.get("page") ?? 1,
      limit: url.searchParams.get("limit") ?? 20,
      status: url.searchParams.get("status") ?? undefined,
      promotion_type: url.searchParams.get("promotion_type") ?? undefined,
    });
    if (!parsed.success) throw new Error("Validation échouée");
    const data = await promotion_service.list(parsed.data);
    return json_ok({ items: data });
  } catch (e) {
    return json_error(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = create_promotion_dto.safeParse(body);
    if (!parsed.success) throw new Error("Validation échouée");
    const data = await promotion_service.create(parsed.data);
    return json_ok(data, 201);
  } catch (e) {
    return json_error(e);
  }
}
