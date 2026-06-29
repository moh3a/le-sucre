const ALLOWED_ORIGINS: Record<string, string[]> = {
  development: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
  production: [],
  test: ["http://localhost:3000"],
};

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Content-Type", "Authorization", "x-csrf-token", "x-request-id"];
const EXPOSED_HEADERS = ["x-request-id"];
const MAX_AGE_SEC = 7200;

function get_configured_origins(): string[] {
  if (typeof process === "undefined" || !process.env) return [];
  const env = process.env.NODE_ENV || "development";
  const origins = [...(ALLOWED_ORIGINS[env] ?? ALLOWED_ORIGINS.development)];
  if (typeof process.env.ALLOWED_ORIGINS === "string") {
    origins.push(...process.env.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim()));
  }
  if (typeof process.env.BETTER_AUTH_URL === "string") {
    origins.push(process.env.BETTER_AUTH_URL);
  }
  return origins;
}

export function get_cors_origin(origin: string | null): string {
  if (!origin) return "";
  const origins = get_configured_origins();
  return origins.includes(origin) ? origin : "";
}

export function cors_headers(origin: string | null): Record<string, string> {
  const allowed_origin = get_cors_origin(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
    "Access-Control-Expose-Headers": EXPOSED_HEADERS.join(", "),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": String(MAX_AGE_SEC),
  };
  if (allowed_origin) {
    headers["Access-Control-Allow-Origin"] = allowed_origin;
  }
  return headers;
}
