/**
 * 
 * Add to .env for seed:
 * 
 * SEED_ADMIN_EMAIL=admin@le-sucre.local
 * SEED_ADMIN_PASSWORD=change-me-32-chars-minimum!!
 * SEED_ADMIN_NAME=Administrateur
 * 
 * Add script: "seed:rbac": "tsx src/features/authentication_and_authorization/authorization/scripts/seed-rbac.ts"
 * 
*/
import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  roles,
  permissions,
  role_permissions,
} from "@/features/authentication_and_authorization/auth/schema";
import { ROLE_NAMES } from "../constants/roles";
import { PERMISSIONS, ROLE_PERMISSION_MAP } from "../constants/permissions";
import { role_repository } from "../repositories/role.repository";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  moderator: "Modérateur",
  operator: "Opérateur",
  delivery_person: "Livreur",
  customer: "Client",
};

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
        .onDuplicateKeyUpdate({ set: {} });
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

  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (existing) {
    user_id = existing.id;
    console.log(`Admin user already exists: ${email}`);
  } else {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });
    user_id = result.user.id;
    console.log(`Created admin user: ${email}`);
  }

  await role_repository.assign_role(user_id!, ROLE_NAMES.admin);
  console.log(`Assigned role "${ROLE_NAMES.admin}" to ${email}`);
}

async function main() {
  console.log("Seeding RBAC...");
  await upsert_roles();
  await upsert_permissions();
  await link_role_permissions();
  await seed_admin_user();
  console.log("RBAC seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
