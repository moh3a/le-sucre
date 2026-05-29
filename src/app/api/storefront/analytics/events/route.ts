import { json_ok, json_error } from "@/lib/http";
import { batch_ingest_dto } from "@/features/analytics_management_system/models/analytics.dto";
import { event_ingestion_service } from "@/features/analytics_management_system/services/event-ingestion.service";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = batch_ingest_dto.safeParse(body);
    if (!parsed.success) throw new Error("Validation échouée");
    const identity = await get_storefront_identity(req.headers);
    const data = await event_ingestion_service.track_batch(parsed.data.events, identity.user_id);
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
