import "server-only";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { AUTH_ERROR } from "@/features/authentication_and_authorization/auth/constants/error-codes";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { ROLE_NAMES } from "@/features/authentication_and_authorization/authorization/constants/roles";
import { login_protection_service } from "@/lib/security/login-protection";
import { logger } from "@/lib/logger";

function is_email(value: string): boolean {
  return value.includes("@");
}

/**
 * Normalizes an Algerian phone number to international format (+213XXXXXXXXX).
 * Accepts: +213 5XX XX XX XX, 05XX XX XX XX, 5XX XX XX XX, +2135XXXXXXXX, 2135XXXXXXXX
 */
export function normalize_phone(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+213")) return cleaned;
  if (cleaned.startsWith("00213")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("213")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+213${cleaned.slice(1)}`;
  return `+213${cleaned}`;
}

/** Generates a placeholder email from phone for Better Auth compatibility. */
function phone_to_email(phone: string): string {
  return `phone_${phone.replace("+", "")}@auth.local`;
}

export class PhoneAuthService {
  /**
   * Sign up with email + password or phone + password.
   */
  async sign_up(input: { name: string; email?: string; phone?: string; password: string }) {
    const has_email = Boolean(input.email && input.email.includes("@"));
    const has_phone = Boolean(input.phone);

    if (!has_email && !has_phone) {
      throw_error({
        code: "AUTH_MISSING_IDENTIFIER",
        status: 400,
        message: {
          fr: "Email ou téléphone requis",
          en: "Email or phone required",
          ar: "البريد الإلكتروني أو رقم الهاتف مطلوب",
        },
      });
    }

    if (has_email) {
      const email = input.email!.trim().toLowerCase();
      const result = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email,
          password: input.password,
          rememberMe: false,
        },
      });
      await role_repository.assign_role(result.user.id, ROLE_NAMES.customer);
      return result;
    }

    // Phone registration — generate placeholder email
    const phone = normalize_phone(input.phone!);
    const email = phone_to_email(phone);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existing.length > 0) {
      throw_error({
        code: "AUTH_PHONE_EXISTS",
        status: 409,
        message: {
          fr: "Ce numéro de téléphone est déjà utilisé",
          en: "This phone number is already in use",
          ar: "رقم الهاتف هذا مستخدم بالفعل",
        },
      });
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email,
        password: input.password,
        rememberMe: false,
      },
    });

    await db.update(users).set({ phone }).where(eq(users.id, result.user.id));
    await role_repository.assign_role(result.user.id, ROLE_NAMES.customer);

    return result;
  }

  /**
   * Sign in with email + password or phone + password.
   */
  async sign_in(input: { identifier: string; password: string; remember_me?: boolean }) {
    const ip = "unknown";

    let userEmail: string;
    let lookupKey: string;

    if (is_email(input.identifier)) {
      userEmail = input.identifier.trim().toLowerCase();
      lookupKey = userEmail;

      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (user.length === 0) {
        await login_protection_service.record_failure(ip, lookupKey);
        throw_error(AUTH_ERROR.INVALID_CREDENTIALS);
      }
    } else {
      const phone = normalize_phone(input.identifier);
      lookupKey = phone;

      const user = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (user.length === 0) {
        await login_protection_service.record_failure(ip, lookupKey);
        throw_error(AUTH_ERROR.INVALID_CREDENTIALS);
      }
      userEmail = user[0].email;
    }

    // Login protection check
    const login_check = await login_protection_service.check_attempt(ip, lookupKey);
    if (!login_check.allowed) {
      throw_error({
        ...AUTH_ERROR.ACCOUNT_LOCKED,
        message: {
          fr: `Compte verrouillé. Réessayez dans ${login_check.lockoutRemainingSec} secondes.`,
          en: `Account locked. Retry in ${login_check.lockoutRemainingSec} seconds.`,
          ar: `الحساب مغلق. أعد المحاولة بعد ${login_check.lockoutRemainingSec} ثانية.`,
        },
      });
    }

    if (login_check.backoffDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, login_check.backoffDelayMs));
    }

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: userEmail,
          password: input.password,
          rememberMe: input.remember_me ?? false,
        },
      });

      await login_protection_service.record_success(ip, lookupKey, result.user.id);
      return result;
    } catch (e) {
      logger.warn(`Failed login attempt`, {
        identifier: lookupKey,
        error: e instanceof Error ? e.message : String(e),
      });
      await login_protection_service.record_failure(ip, lookupKey);
      throw_error(AUTH_ERROR.INVALID_CREDENTIALS);
    }
  }

  /** Resolve phone/email to user info. */
  async find_by_identifier(identifier: string) {
    if (is_email(identifier)) {
      const email = identifier.trim().toLowerCase();
      const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return user ?? null;
    }

    const normalized = normalize_phone(identifier);
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);
    return user ?? null;
  }

  /** Resolve phone to user info (backward compat). */
  async find_by_phone(phone: string) {
    const normalized = normalize_phone(phone);
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);
    return user ?? null;
  }

  /** Get the current session. */
  async get_session() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw_error(AUTH_ERROR.SESSION_REQUIRED);
    return session;
  }

  /** Get optional session (returns null instead of throwing). */
  async get_optional_session() {
    return auth.api.getSession({ headers: await headers() });
  }
}

export const phone_auth_service = new PhoneAuthService();
