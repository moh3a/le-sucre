import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { APP_NAME } from "@/constants";
import * as authSchema from "@/features/authentication_and_authorization/auth/schema";
import {
  ROLE_NAMES,
} from "@/features/authentication_and_authorization/authorization/constants/roles";
import { role_repository } from "@/features/authentication_and_authorization/authorization/repositories/role.repository";
import { db } from "../db";
import { RoleName } from "@/features/authentication_and_authorization/authorization/constants/roles";

const auth_options = {
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: authSchema.users,
      session: authSchema.sessions,
      account: authSchema.accounts,
      verification: authSchema.verifications,
    },
  }),
  plugins: [
    admin({
      // adminRoles: ["admin", "moderator"],
      schema: {
        user: {
          fields: {
            banExpires: "ban_expires",
            banReason: "ban_reason",
            impersonatedBy: "impersonated_by",
          },
        },
        session: {
          fields: {
            impersonatedBy: "impersonated_by",
          },
        },
      },
    }),
    customSession(async ({ user, session }) => {
      const rows = await db
        .select({ roleName: authSchema.roles.name })
        .from(authSchema.user_roles)
        .innerJoin(
          authSchema.roles,
          eq(authSchema.user_roles.role_id, authSchema.roles.id),
        )
        .where(eq(authSchema.user_roles.user_id, user.id))
        .limit(1);

      return {
        user,
        session,
        userRole: (rows[0]?.roleName as RoleName) ?? null,
      };
    }),
  ],
  account: {
    fields: {
      accountId: "account_id",
      accessToken: "access_token",
      accessTokenExpiresAt: "access_token_expires_at",
      createdAt: "created_at",
      idToken: "id_token",
      providerId: "provider_id",
      refreshToken: "refresh_token",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      updatedAt: "updated_at",
      userId: "user_id",
    },
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days session lifetime
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session cookie in browser for 5 minutes
    },
  },
  verification: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  appName: APP_NAME,
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
  // rateLimit: {
  //   enabled: true,
  //   window: 60,
  //   max: 20,
  //   storage: "memory", // swap to custom redis store next iteration
  // },
  databaseHooks: {
    user: {
      create: {
        after: async (user: Record<string, unknown>) => {
          await role_repository.assign_role(
            user.id as string,
            ROLE_NAMES.customer,
          );
        },
      },
    },
  },
};

export const auth = betterAuth(auth_options);

export type AuthInstance = typeof auth;
export default auth;
