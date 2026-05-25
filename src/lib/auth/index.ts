import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { APP_NAME } from "@/consts";
import * as authSchema from "@/features/authentication_and_authorization/auth/schema";
import { db } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: authSchema.users,
      session: authSchema.sessions,
      account: authSchema.accounts,
      verification: authSchema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  appName: APP_NAME,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days session lifetime
    updateAge: 60 * 60 * 24,     // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session cookie in browser for 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "le_sucre",
    crossSubdomainCookie: {
      enabled: false,
    },
  },
  // Enforce secure TLS bound cookies in production
  cookies: {
    sessionToken: {
      name: "le_sucre_session_token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
});

export type AuthInstance = typeof auth;
export default auth;
