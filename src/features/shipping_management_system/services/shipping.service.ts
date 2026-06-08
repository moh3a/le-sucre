import "server-only";

import { generate_id } from "@/lib/utils";
import { NotFoundError, ConflictError } from "@/lib/error_handling";
import { shipping_repository } from "../repository";
import { get_shipping_provider } from "../providers/provider-registry";
import type { ShippingProviderName } from "../providers/contracts";
import { format } from "date-fns";

export class ShippingService {
  constructor(private readonly repo = shipping_repository) {}

  async quote(input: {
    provider: ShippingProviderName;
    to_city: string;
    country_code: string;
    weight_kg: number;
    is_cod: boolean;
    cod_amount?: number;
  }) {
    const provider = get_shipping_provider(input.provider);
    return provider.quote(input);
  }

  async create_for_order(input: {
    order_id: string;
    provider: ShippingProviderName;
    weight_kg: number;
  }) {
    const order = await this.repo.get_order(input.order_id);
    if (!order) throw new NotFoundError("Commande introuvable");

    const exists = await this.repo.find_shipment_by_order(input.order_id);
    if (exists) throw new ConflictError("Expédition déjà créée pour cette commande");

    const shipping_address = order.shipping_address as Record<string, unknown>;
    const provider = get_shipping_provider(input.provider);

    const created = await provider.create_shipment({
      order_id: order.id,
      reference: order.order_number,
      recipient_name: String(shipping_address.full_name ?? ""),
      recipient_phone: String(shipping_address.phone ?? ""),
      address_line1: String(shipping_address.line1 ?? ""),
      address_line2: shipping_address.line2 ? String(shipping_address.line2) : null,
      city: String(shipping_address.city ?? ""),
      state: shipping_address.state ? String(shipping_address.state) : null,
      postal_code: shipping_address.postal_code ? String(shipping_address.postal_code) : null,
      country_code: String(shipping_address.country_code ?? "DZ"),
      weight_kg: input.weight_kg,
      is_cod: true,
      cod_amount: order.grand_total ? String(order.grand_total) : null,
    });

    const shipment = await this.repo.create_shipment({
      id: generate_id(),
      order_id: order.id,
      provider: input.provider,
      provider_shipment_id: created.provider_shipment_id,
      tracking_number: created.tracking_number,
      tracking_url: created.tracking_url ?? null,
      status: created.status,
      delivery_status: "pending",
      shipping_cost: order.shipping_total,
      currency: order.currency,
      recipient_name: String(shipping_address.full_name ?? ""),
      recipient_phone: String(shipping_address.phone ?? ""),
      address_line1: String(shipping_address.line1 ?? ""),
      address_line2: shipping_address.line2 ? String(shipping_address.line2) : null,
      city: String(shipping_address.city ?? ""),
      state: shipping_address.state ? String(shipping_address.state) : null,
      postal_code: shipping_address.postal_code ? String(shipping_address.postal_code) : null,
      country_code: String(shipping_address.country_code ?? "DZ"),
      package_weight_kg: String(input.weight_kg),
      is_cod: true,
      cod_amount: order.grand_total,
      metadata: created.raw_payload ?? {},
    });

    await this.repo.update_shipment(shipment!.id, { last_sync_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") });
    await this.sync_tracking(shipment!.id);

    return this.get_shipment_detail(shipment!.id);
  }

  async sync_tracking(shipment_id: string) {
    const shipment = await this.repo.find_shipment(shipment_id);
    if (!shipment) throw new NotFoundError("Expédition introuvable");
    if (!shipment.tracking_number) throw new ConflictError("Numéro de suivi manquant");

    const provider = get_shipping_provider(shipment.provider as ShippingProviderName);
    const tracking = await provider.get_tracking(shipment.tracking_number);

    await this.repo.update_shipment(shipment_id, {
      status: tracking.status,
      delivery_status: tracking.delivery_status,
      tracking_url: tracking.tracking_url ?? shipment.tracking_url,
      last_sync_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      metadata: tracking.raw_payload ?? shipment.metadata,
    });

    await this.repo.insert_tracking_events(
      tracking.events.map((e) => ({
        id: generate_id(),
        shipment_id,
        provider_event_id: e.provider_event_id ?? null,
        status: e.status,
        description: e.description ?? null,
        location: e.location ?? null,
        occurred_at: e.occurred_at,
        raw_payload: e.raw_payload ?? {},
      })),
    );

    return this.get_shipment_detail(shipment_id);
  }

  async get_shipment_detail(shipment_id: string) {
    const shipment = await this.repo.find_shipment(shipment_id);
    if (!shipment) throw new NotFoundError("Expédition introuvable");
    const events = await this.repo.get_tracking_events(shipment_id);
    return { shipment, tracking_events: events };
  }

  async tracking_by_order(order_id: string) {
    const shipment = await this.repo.find_shipment_by_order(order_id);
    if (!shipment) throw new NotFoundError("Aucune expédition");
    return this.get_shipment_detail(shipment.id);
  }
}

export const shipping_service = new ShippingService();
