import { json_ok, json_error } from "@/lib/http";
import { shipping_webhook_service } from "@/features/shipping_management_system/services/shipping-webhook.service";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    await shipping_webhook_service.handle_provider_webhook("yalidine", req.headers, raw);
    return json_ok({ ok: true });
  } catch (e) {
    return json_error(e);
  }
}
