import "server-only";
import crypto from "crypto";

const nonces = new Map<string, string>();

export function generate_csp_nonce(): string {
  const nonce = crypto.randomBytes(16).toString("base64url");
  return nonce;
}

export function create_script_nonce(): string {
  const nonce = generate_csp_nonce();
  nonces.set("script", nonce);
  setTimeout(() => nonces.delete("script"), 60000);
  return nonce;
}

export function get_current_nonce(tag: string = "script"): string | undefined {
  return nonces.get(tag);
}
