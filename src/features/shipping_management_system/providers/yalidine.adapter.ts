/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { verify_hmac_signature, verify_webhook_timestamp } from "@/lib/security/webhook";
import type {
  ShippingProviderAdapter,
  ShippingQuoteInput,
  ShippingQuoteResult,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackingResult,
} from "./contracts";
import { format } from "date-fns";

const YALIDINE_API = process.env.YALIDINE_API_URL ?? "https://api.yalidine.app/v1";
const YALIDINE_TOKEN = process.env.YALIDINE_API_TOKEN ?? "";

async function yalidine_fetch(path: string, init?: RequestInit) {
  if (!YALIDINE_TOKEN) throw new Error("YALIDINE_API_TOKEN missing");
  const res = await fetch(`${YALIDINE_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": YALIDINE_TOKEN,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Yalidine API error ${res.status}: ${body}`);
  }
  return res.json();
}

export class YalidineAdapter implements ShippingProviderAdapter {
  readonly name = "yalidine" as const;

  async quote(input: ShippingQuoteInput): Promise<ShippingQuoteResult> {
    const data = await yalidine_fetch("/shipping/quote", {
      method: "POST",
      body: JSON.stringify({
        to_city: input.to_city,
        country_code: input.country_code,
        weight_kg: input.weight_kg,
        cod_amount: input.cod_amount ?? 0,
        is_cod: input.is_cod,
      }),
    });

    return {
      provider: "yalidine",
      service_code: "standard",
      service_name: "Yalidine Standard",
      amount: String(data.amount ?? 0),
      currency: "DZD",
      eta_days_min: data.eta_min ?? 2,
      eta_days_max: data.eta_max ?? 5,
    };
  }

  async create_shipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const data = await yalidine_fetch("/shipments", {
      method: "POST",
      body: JSON.stringify({
        reference: input.reference,
        recipient_name: input.recipient_name,
        recipient_phone: input.recipient_phone,
        address_line1: input.address_line1,
        address_line2: input.address_line2 ?? undefined,
        city: input.city,
        state: input.state ?? undefined,
        postal_code: input.postal_code ?? undefined,
        country_code: input.country_code,
        weight_kg: input.weight_kg,
        is_cod: input.is_cod,
        cod_amount: input.cod_amount ? Number(input.cod_amount) : 0,
      }),
    });

    return {
      provider_shipment_id: String(data.id),
      tracking_number: String(data.tracking_number),
      tracking_url: data.tracking_url ?? null,
      status: String(data.status ?? "created"),
      raw_payload: data,
    };
  }

  async get_tracking(tracking_number: string): Promise<TrackingResult> {
    const data = await yalidine_fetch(`/shipments/tracking/${encodeURIComponent(tracking_number)}`);

    const events = Array.isArray(data.events)
      ? data.events.map((e: any) => ({
          provider_event_id: e.id ? String(e.id) : undefined,
          status: String(e.status ?? "unknown"),
          description: e.description ? String(e.description) : undefined,
          location: e.location ? String(e.location) : undefined,
          occurred_at: e.occurred_at ?? format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          raw_payload: e,
        }))
      : [];

    return {
      status: String(data.status ?? "in_transit"),
      delivery_status: String(data.delivery_status ?? "in_transit"),
      tracking_number,
      tracking_url: data.tracking_url,
      events,
      raw_payload: data,
    };
  }

  async verify_webhook(headers: Headers, raw_body?: string) {
    const secret = process.env.YALIDINE_WEBHOOK_SECRET;
    if (!secret) return false;
    const signature = headers.get("x-yalidine-signature");
    const timestamp = headers.get("x-yalidine-timestamp");
    if (!signature || !timestamp) return false;
    if (!verify_webhook_timestamp(timestamp)) return false;
    if (!raw_body) return false;
    const signed_payload = `${timestamp}.${raw_body}`;
    return verify_hmac_signature(signed_payload, signature, secret, "sha256");
  }

  async parse_webhook(payload: any) {
    const tn = payload?.tracking_number ?? payload?.data?.tracking_number;
    if (!tn) return null;
    return { tracking_number: String(tn) };
  }
}

export const yalidine_adapter = new YalidineAdapter();
