import "server-only";

const FORBIDDEN_EXPORT_CHARS = /[=+\-@\t\r\n]/;
const MAX_EXPORT_ROWS = 10000;
const MAX_EXPORT_COLUMNS = 50;

export function sanitize_csv_value(value: string): string {
  if (FORBIDDEN_EXPORT_CHARS.test(value[0] ?? "")) {
    return `'${value}`;
  }
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function sanitize_csv_row(row: string[]): string[] {
  return row.map(sanitize_csv_value);
}

export function prevent_csv_injection(data: string[][]): string[][] {
  return data.map((row) => sanitize_csv_row(row));
}

export function validate_export_request(page: number, per_page: number): void {
  if (page < 1) throw new Error("Page must be at least 1");
  if (per_page < 1 || per_page > MAX_EXPORT_ROWS) {
    throw new Error(`Export limit: ${MAX_EXPORT_ROWS} rows max`);
  }
}

export function sanitize_export_filename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "")
    .substring(0, 100);
}

export const EXPORT_PERMISSIONS: Record<string, string[]> = {
  products: ["products:export"],
  orders: ["orders:export"],
  customers: ["customers:export"],
  reviews: ["reviews:export"],
  analytics: ["analytics:export"],
  inventory: ["inventory:export"],
} as const;

export function get_export_permission(resource: string): string | undefined {
  return EXPORT_PERMISSIONS[resource as keyof typeof EXPORT_PERMISSIONS]?.[0];
}
