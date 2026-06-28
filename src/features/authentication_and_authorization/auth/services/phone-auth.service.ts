import "server-only";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { AUTH_ERROR } from "@/features/authentication_and_authorization/auth/constants/error-codes";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { ROLE_NAMES } from "@/features/authentication_and_authorization/authorization/constants/roles";

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
   * Sign up with phone + password.
   * Creates a Better Auth user with auto-generated email, stores phone on the user record.
   */
  async sign_up(input: { name: string; phone: string; password: string }) {
    const phone = normalize_phone(input.phone);
    const email = phone_to_email(phone);

    // Check phone uniqueness manually (Better Auth will check email uniqueness)
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

    // Create user via Better Auth with auto-generated email
    const result = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email,
        password: input.password,
        rememberMe: false,
      },
    });

    // Store phone on the user record
    await db.update(users).set({ phone }).where(eq(users.id, result.user.id));

    // Assign customer role
    await role_repository.assign_role(result.user.id, ROLE_NAMES.customer);

    return result;
  }

  /**
   * Sign in with phone + password.
   * Looks up the user by phone, resolves their auto-generated email, and authenticates.
   */
  async sign_in(input: { phone: string; password: string; remember_me?: boolean }) {
    const phone = normalize_phone(input.phone);

    const user = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (user.length === 0) {
      throw_error(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    // Sign in via Better Auth using the user's email (auto-generated from phone)
    const result = await auth.api.signInEmail({
      body: {
        email: user[0].email,
        password: input.password,
        rememberMe: input.remember_me ?? false,
      },
    });

    return result;
  }

  /** Resolve phone to user info (for internal lookups). */
  async find_by_phone(phone: string) {
    const normalized = normalize_phone(phone);
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);
    return user ?? null;
  }

  /** Get the current session (same as existing AuthService.get_session). */
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
