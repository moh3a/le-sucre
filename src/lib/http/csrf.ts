const CSRF_COOKIE = "le_sucre_csrf";

export function get_csrf_token(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function csrf_safe_fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = get_csrf_token();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("x-csrf-token", token);
  }
  return fetch(input, { ...init, headers });
}
