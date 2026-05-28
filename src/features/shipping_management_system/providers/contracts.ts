export type ShippingProviderName = "yalidine" | "dhl" | "fedex" | "ups" | "ems";

export type ShippingQuoteInput = {
  from_city?: string;
  to_city: string;
  country_code: string;
  weight_kg: number;
  cod_amount?: number;
  is_cod: boolean;
};

export type ShippingQuoteResult = {
  provider: ShippingProviderName;
  service_code: string;
  service_name: string;
  amount: string;
  currency: string;
  eta_days_min?: number;
  eta_days_max?: number;
};

export type CreateShipmentInput = {
  order_id: string;
  reference: string;
  recipient_name: string;
  recipient_phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country_code: string;
  weight_kg: number;
  is_cod: boolean;
  cod_amount?: string | null;
};

export type CreateShipmentResult = {
  provider_shipment_id: string;
  tracking_number: string;
  tracking_url?: string | null;
  status: string;
  raw_payload?: Record<string, unknown>;
};

export type TrackingEvent = {
  provider_event_id?: string;
  status: string;
  description?: string;
  location?: string;
  occurred_at: string;
  raw_payload?: Record<string, unknown>;
};

export type TrackingResult = {
  status: string;
  delivery_status: string;
  tracking_number?: string;
  tracking_url?: string;
  events: TrackingEvent[];
  raw_payload?: Record<string, unknown>;
};

export interface ShippingProviderAdapter {
  readonly name: ShippingProviderName;
  quote(input: ShippingQuoteInput): Promise<ShippingQuoteResult>;
  create_shipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  get_tracking(tracking_number: string): Promise<TrackingResult>;
  verify_webhook?(headers: Headers, raw_body: string): Promise<boolean>;
  parse_webhook?(payload: unknown): Promise<{ tracking_number: string } | null>;
}
