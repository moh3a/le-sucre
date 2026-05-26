/**
 *
 * Add to .env for seed:
 *
 * SEED_ADMIN_EMAIL=admin@le-sucre.local
 * SEED_ADMIN_PASSWORD=change-me-32-chars-minimum!!
 * SEED_ADMIN_NAME=Administrateur
 *
 */
import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { create_script_db } from "@/lib/db/script-client";
import logger from "@/lib/logger";
import {
  roles,
  permissions,
  role_permissions,
  users,
  sessions,
  accounts,
  verifications,
  user_roles,
} from "@/features/authentication_and_authorization/auth/schema";
import { ROLE_LABELS, ROLE_NAMES } from "../constants/roles";
import { PERMISSIONS, ROLE_PERMISSION_MAP } from "../constants/permissions";

const db = create_script_db();
const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
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
  },
  verification: {
    fields: {
      createdAt: "created_at",
      expiresAt: "expires_at",
      updatedAt: "updated_at",
    },
  },
  emailAndPassword: { enabled: true },
});

async function assign_role(user_id: string, role_name: string) {
  const [role] = await db.select().from(roles).where(eq(roles.name, role_name)).limit(1);
  if (!role) throw new Error(`Role ${role_name} not found`);
  await db
    .insert(user_roles)
    .values({ user_id, role_id: role.id })
    .onDuplicateKeyUpdate({
      set: {
        created_at: sql`${user_roles.created_at}`,
      },
    });
}

async function upsert_roles() {
  for (const name of Object.values(ROLE_NAMES)) {
    const existing = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    if (!existing.length) {
      await db.insert(roles).values({
        name,
        description: ROLE_LABELS[name] ?? name,
      });
    }
  }
}

async function upsert_permissions() {
  for (const name of Object.values(PERMISSIONS)) {
    const existing = await db.select().from(permissions).where(eq(permissions.name, name)).limit(1);
    if (!existing.length) {
      await db.insert(permissions).values({ name, description: name });
    }
  }
}

async function link_role_permissions() {
  const all_roles = await db.select().from(roles);
  const all_permissions = await db.select().from(permissions);

  for (const role of all_roles) {
    const perm_names = ROLE_PERMISSION_MAP[role.name] ?? [];
    for (const perm_name of perm_names) {
      const perm = all_permissions.find((p) => p.name === perm_name);
      if (!perm) continue;
      await db
        .insert(role_permissions)
        .values({ role_id: role.id, permission_id: perm.id })
        .onDuplicateKeyUpdate({
          set: {
            created_at: sql`${role_permissions.created_at}`,
          },
        });
    }
  }
}

async function seed_admin_user() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Administrateur";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required");
  }

  let user_id: string | undefined;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    user_id = existing.id;
    logger.info(`Admin user already exists: ${email}`);
  } else {
    const result = await auth.api.signUpEmail({
      body: { email, password, name, rememberMe: false },
    });
    user_id = result.user.id;
    logger.info(`Created admin user: ${email}`);
  }

  await assign_role(user_id!, ROLE_NAMES.admin);
  logger.info(`Assigned role "${ROLE_NAMES.admin}" to ${email}`);
}

async function main() {
  logger.info("Seeding RBAC...");
  logger.info("Upsert roles...");
  await upsert_roles();
  logger.info("Upsert permissions...");
  await upsert_permissions();
  logger.info("Link roles to permissions...");
  await link_role_permissions();
  logger.info("Creating the first admin user...");
  await seed_admin_user();
  logger.info("RBAC seed complete.");
  process.exit(0);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
