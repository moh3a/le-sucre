import "server-only";

import { verify_hmac_signature, verify_webhook_timestamp } from "@/lib/security/webhook";
import { format } from "date-fns";
import type {
  ShippingProviderAdapter,
  ShippingQuoteInput,
  ShippingQuoteResult,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackingResult,
  ProviderShipmentList,
  ProviderStatusBucket,
} from "./contracts";

interface YalidineParcel {
  id?: string | number;
  tracking?: string;
  label?: string;
  status?: string;
  last_status?: string;
  firstname?: string;
  familyname?: string;
  contact_phone?: string;
  to_commune_name?: string;
  to_wilaya_name?: string;
  address?: string;
  price?: string | number;
  created_at?: string;
  updated_at?: string;
  histories?: Array<{
    date?: string;
    status?: string;
    note?: string;
    description?: string;
  }>;
  [key: string]: unknown;
}

interface YalidineWebhookPayload {
  tracking_number?: string;
  data?: { tracking_number?: string };
}

const YALIDINE_API = process.env.YALIDINE_API_URL ?? "https://api.yalidine.app/v1";
const YALIDINE_API_ID = "94986571734304520846"; // process.env.YALIDINE_API_ID ?? "";
const YALIDINE_TOKEN = "5MKfvcyQtO3eouL6tDv0VDFhUT8Sc7w5"; // process.env.YALIDINE_API_TOKEN ?? "";

async function yalidine_fetch(path: string, init?: RequestInit) {
  if (!YALIDINE_API_ID || !YALIDINE_TOKEN) {
    throw new Error("YALIDINE_API_ID and YALIDINE_API_TOKEN are required");
  }
  const res = await fetch(`${YALIDINE_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-ID": YALIDINE_API_ID,
      "X-API-TOKEN": YALIDINE_TOKEN,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    const detail = body.length ? `: ${body}` : "";
    switch (res.status) {
      case 401:
        throw new Error(`Yalidine API credentials invalid (401)${detail}`);
      case 403:
        throw new Error(`Yalidine API access is not enabled for this account (403)${detail}`);
      case 429:
        throw new Error(`Yalidine API rate limit exceeded (429)${detail}`);
      default:
        throw new Error(`Yalidine API error ${res.status}${detail}`);
    }
  }
  return res.json();
}

function as_parcel_array(data: unknown): YalidineParcel[] {
  if (Array.isArray(data)) return data as YalidineParcel[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: YalidineParcel[] }).results;
  }
  const single = data as YalidineParcel | null | undefined;
  return single ? [single] : [];
}

function normalize_status(raw?: string): ProviderStatusBucket {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("livré") || value.includes("livre") || value === "delivered")
    return "delivered";
  if (value.includes("retour") || value.includes("returned")) return "returned";
  if (
    value.includes("échec") ||
    value.includes("echec") ||
    value.includes("non livré") ||
    value.includes("failed")
  ) {
    return "failed";
  }
  if (
    value.includes("en cours") ||
    value.includes("expédié") ||
    value.includes("expedie") ||
    value.includes("in_transit")
  ) {
    return "in_transit";
  }
  return "unknown";
}

function delivery_status_for(bucket: ProviderStatusBucket): string {
  switch (bucket) {
    case "delivered":
      return "delivered";
    case "returned":
    case "failed":
      return "failed";
    default:
      return "in_transit";
  }
}

function split_full_name(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstname: parts[0] ?? "", familyname: parts.slice(1).join(" ") };
}

function normalize_phone(phone: string) {
  let value = phone.replace(/[\s-]/g, "");
  if (value.startsWith("+213")) value = `0${value.slice(4)}`;
  return value;
}

export class YalidineAdapter implements ShippingProviderAdapter {
  readonly name = "yalidine" as const;
  readonly supports_quote = false;

  async quote(_input: ShippingQuoteInput): Promise<ShippingQuoteResult> {
    throw new Error("Yalidine does not expose a public quote endpoint");
  }

  async create_shipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const { firstname, familyname } = split_full_name(input.recipient_name);

    const data = (await yalidine_fetch("/parcels", {
      method: "POST",
      body: JSON.stringify({
        order_id: input.reference,
        firstname,
        familyname,
        contact_phone: normalize_phone(input.recipient_phone),
        address: input.address_line1,
        to_commune_name: input.city,
        to_wilaya_name: input.state ?? input.city,
        product_list: input.reference,
        price: input.cod_amount ? Number(input.cod_amount) : 0,
        do_insurance: false,
        declared_value: input.cod_amount ? Number(input.cod_amount) : 0,
        weight: input.weight_kg,
        freeshipping: false,
        is_stopdesk: false,
        has_exchange: false,
      }),
    })) as YalidineParcel;

    const tracking_number = String(data.tracking ?? "");
    if (!tracking_number) {
      throw new Error("Yalidine create parcel returned no tracking number");
    }

    return {
      provider_shipment_id: String(data.id ?? tracking_number),
      tracking_number,
      tracking_url: null,
      label_url: data.label ?? null,
      status: normalize_status(data.last_status ?? data.status),
      raw_payload: data as unknown as Record<string, unknown>,
    };
  }

  async get_tracking(tracking_number: string): Promise<TrackingResult> {
    const data = await yalidine_fetch(`/parcels/${encodeURIComponent(tracking_number)}`);
    const parcels = as_parcel_array(data);
    const parcel = parcels[0] ?? {};

    const bucket = normalize_status(parcel.last_status ?? parcel.status);
    const raw_histories = Array.isArray(parcel.histories) ? parcel.histories : [];

    const events = raw_histories.map((h) => ({
      provider_event_id: undefined,
      status: String(h.status ?? "unknown"),
      description: h.note ?? h.description,
      location: undefined,
      occurred_at: h.date ?? format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      raw_payload: h as unknown as Record<string, unknown>,
    }));

    return {
      status: bucket,
      delivery_status: delivery_status_for(bucket),
      tracking_number,
      tracking_url: null,
      events,
      raw_payload: parcel as unknown as Record<string, unknown>,
    };
  }

  async list_shipments(input: {
    page: number;
    page_size?: number;
    status?: string;
  }): Promise<ProviderShipmentList> {
    const params = new URLSearchParams({
      page: String(Math.max(input.page, 1)),
      page_size: String(Math.min(Math.max(input.page_size ?? 20, 1), 100)),
    });
    if (input.status) params.set("last_status", input.status);

    const data = await yalidine_fetch(`/parcels?${params.toString()}`);
    const parcels = as_parcel_array(data);

    return {
      items: parcels.map((p) => {
        const bucket = normalize_status(p.last_status ?? p.status);
        return {
          provider_shipment_id: String(p.id ?? p.tracking ?? ""),
          tracking_number: String(p.tracking ?? ""),
          status_bucket: bucket,
          label_url: p.label ?? null,
          recipient_name: [p.firstname, p.familyname].filter(Boolean).join(" "),
          city: p.to_commune_name ?? p.to_wilaya_name,
          price: p.price != null ? String(p.price) : undefined,
          updated_at: p.updated_at ?? null,
          raw_payload: p as unknown as Record<string, unknown>,
        };
      }),
      total: parcels.length,
    };
  }

  async get_label(tracking_number: string): Promise<string> {
    const data = await yalidine_fetch(`/parcels/${encodeURIComponent(tracking_number)}`);
    const parcels = as_parcel_array(data);
    const label = parcels[0]?.label;
    if (!label) throw new Error(`No label available for parcel ${tracking_number}`);
    return String(label);
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

  async parse_webhook(payload: YalidineWebhookPayload) {
    const tn = payload?.tracking_number ?? payload?.data?.tracking_number;
    if (!tn) return null;
    return { tracking_number: String(tn) };
  }
}

export const yalidine_adapter = new YalidineAdapter();
