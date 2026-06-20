import "server-only";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  mfa_settings,
  mfa_backup_codes,
} from "@/features/authentication_and_authorization/auth/mfa_schema";
import { AppError, NotFoundError, ValidationError } from "@/lib/error_handling";

const TOTP_INTERVAL_SEC = 30;
const TOTP_CODE_LENGTH = 6;
const BACKUP_CODE_COUNT = 8;

function base32_encode(buffer: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >> bits) & 0x1f];
    }
  }
  if (bits > 0) result += alphabet[(value << (5 - bits)) & 0x1f];
  return result;
}

function hotp(secret: Uint8Array, counter: number): string {
  const counter_buf = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counter_buf[i] = counter & 0xff;
    counter >>= 8;
  }
  const hmac = crypto.createHmac("sha1", secret);
  hmac.update(counter_buf);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  const modulo = Math.pow(10, TOTP_CODE_LENGTH);
  return String(code % modulo).padStart(TOTP_CODE_LENGTH, "0");
}

function totp(secret: Uint8Array, timestamp: number = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / TOTP_INTERVAL_SEC);
  return hotp(secret, counter);
}

export class MfaService {
  generate_totp_secret(): string {
    const buffer = crypto.randomBytes(20);
    return base32_encode(buffer);
  }

  generate_totp_code(secret: string): string {
    const secret_buffer = Buffer.from(secret, "ascii");
    return totp(secret_buffer);
  }

  verify_totp(secret: string, code: string): boolean {
    const secret_buffer = Buffer.from(secret, "ascii");
    const now = Date.now();
    for (let i = -1; i <= 1; i++) {
      const expected = totp(secret_buffer, now + i * TOTP_INTERVAL_SEC * 1000);
      if (expected === code) return true;
    }
    return false;
  }

  generate_backup_codes(): { plain: string[]; hashed: string[] } {
    const codes: string[] = [];
    const hashed: string[] = [];
    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
      hashed.push(crypto.createHash("sha256").update(code).digest("hex"));
    }
    return { plain: codes, hashed };
  }

  async enable_totp(user_id: string): Promise<{ secret: string; backup_codes: string[] }> {
    const existing = await db
      .select()
      .from(mfa_settings)
      .where(and(eq(mfa_settings.user_id, user_id), eq(mfa_settings.method, "totp")))
      .limit(1);

    const secret = this.generate_totp_secret();
    const { plain: backup_codes, hashed: hashed_codes } = this.generate_backup_codes();

    if (existing.length > 0) {
      await db
        .update(mfa_settings)
        .set({ totp_secret: secret, is_enabled: false })
        .where(eq(mfa_settings.id, existing[0].id));
    } else {
      await db.insert(mfa_settings).values({
        user_id,
        method: "totp",
        totp_secret: secret,
      });
    }

    for (const code_hash of hashed_codes) {
      await db.insert(mfa_backup_codes).values({ user_id, code_hash });
    }

    return { secret, backup_codes };
  }

  async verify_and_enable(user_id: string, code: string): Promise<boolean> {
    const settings = await db
      .select()
      .from(mfa_settings)
      .where(and(eq(mfa_settings.user_id, user_id), eq(mfa_settings.method, "totp")))
      .limit(1);

    if (settings.length === 0) throw new NotFoundError("MFA not initialized");
    if (!settings[0].totp_secret) throw new ValidationError("TOTP secret not found");

    if (!this.verify_totp(settings[0].totp_secret, code)) {
      return false;
    }

    await db
      .update(mfa_settings)
      .set({ is_enabled: true, last_verified_at: new Date().toISOString() })
      .where(eq(mfa_settings.id, settings[0].id));

    return true;
  }

  async verify_mfa(user_id: string, code: string): Promise<boolean> {
    const settings = await db
      .select()
      .from(mfa_settings)
      .where(
        and(
          eq(mfa_settings.user_id, user_id),
          eq(mfa_settings.method, "totp"),
          eq(mfa_settings.is_enabled, true),
        ),
      )
      .limit(1);

    if (settings.length === 0) return true;

    if (settings[0].totp_secret && this.verify_totp(settings[0].totp_secret, code)) {
      return true;
    }

    const code_hash = crypto.createHash("sha256").update(code).digest("hex");
    const backup = await db
      .select()
      .from(mfa_backup_codes)
      .where(
        and(
          eq(mfa_backup_codes.user_id, user_id),
          eq(mfa_backup_codes.code_hash, code_hash),
          eq(mfa_backup_codes.is_used, false),
        ),
      )
      .limit(1);

    if (backup.length > 0) {
      await db
        .update(mfa_backup_codes)
        .set({ is_used: true, used_at: new Date().toISOString() })
        .where(eq(mfa_backup_codes.id, backup[0].id));
      return true;
    }

    return false;
  }

  async disable_mfa(user_id: string): Promise<void> {
    await db
      .delete(mfa_settings)
      .where(and(eq(mfa_settings.user_id, user_id), eq(mfa_settings.method, "totp")));

    await db.delete(mfa_backup_codes).where(eq(mfa_backup_codes.user_id, user_id));
  }

  async is_mfa_enabled(user_id: string): Promise<boolean> {
    const rows = await db
      .select({ id: mfa_settings.id })
      .from(mfa_settings)
      .where(and(eq(mfa_settings.user_id, user_id), eq(mfa_settings.is_enabled, true)))
      .limit(1);
    return rows.length > 0;
  }
}

export const mfa_service = new MfaService();

export function generate_verification_token(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hash_token(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
