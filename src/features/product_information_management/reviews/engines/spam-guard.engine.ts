import "server-only";
import { createHash } from "node:crypto";
import { rate_limit } from "@/lib/redis";
import { ValidationError } from "@/lib/error_handling";

const BANNED_PATTERNS = [/https?:\/\//i, /telegram/i, /whatsapp/i, /call me/i];

export function hash_text(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function assert_review_content_safe(body: string, title?: string | null) {
  const text = `${title ?? ""} ${body}`;
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) throw new ValidationError("Contenu non autorisé");
  }
}

export async function assert_review_rate_limit(user_id: string, ip_hash?: string | null) {
  const user_rl = await rate_limit(`reviews:create:user:${user_id}`, 3, 3600);
  if (!user_rl.allowed) throw new ValidationError("Trop d'avis envoyés, réessayez plus tard");

  if (ip_hash) {
    const ip_rl = await rate_limit(`reviews:create:ip:${ip_hash}`, 8, 3600);
    if (!ip_rl.allowed) throw new ValidationError("Limite atteinte pour cette adresse IP");
  }
}
