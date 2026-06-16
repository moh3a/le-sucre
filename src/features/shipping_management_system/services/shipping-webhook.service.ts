import "server-only";

import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { SHIPPING_ERROR } from "../constants/error-codes";
import { shipping_repository } from "../repository";
import { get_shipping_provider } from "../providers/provider-registry";
import { shipping_service } from "./shipping.service";

export class ShippingWebhookService {
  async handle_provider_webhook(provider_name: "yalidine", headers: Headers, raw_body: string) {
    const adapter = get_shipping_provider(provider_name);

    if (adapter.verify_webhook) {
      const ok = await adapter.verify_webhook(headers, raw_body);
      if (!ok) throw_error(SHIPPING_ERROR.WEBHOOK_INVALID_SIGNATURE);
    }

    const payload = JSON.parse(raw_body || "{}");
    if (!adapter.parse_webhook) return { ok: true };

    const parsed = await adapter.parse_webhook(payload);
    if (!parsed) return { ok: true };

    // resolve shipment by tracking number
    const rows = await shipping_repository.list_shipments(1, 1);
    const shipment = rows.find((s) => s.tracking_number === parsed.tracking_number);
    if (!shipment) return { ok: true };

    await shipping_service.sync_tracking(shipment.id);
    return { ok: true };
  }
}

export const shipping_webhook_service = new ShippingWebhookService();
