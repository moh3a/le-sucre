/** Extensible product metadata — suppliers, warranty, specs plug in here. */
export type ProductMetadata = {
  supplier_id?: string;
  manufacturer?: string;
  warranty_months?: number;
  technical_specs?: Record<string, string | number | boolean>;
  [key: string]: unknown;
};

export type ProductMediaMetadata = {
  storage_key?: string;
  width?: number;
  height?: number;
  size?: number;
  provider?: "local" | "s3" | "r2" | "cdn";
  [key: string]: unknown;
};
