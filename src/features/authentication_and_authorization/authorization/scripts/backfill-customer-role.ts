import "dotenv/config";
import { sql, inArray, notInArray } from "drizzle-orm";
import { create_script_db } from "@/lib/db/script-client";
import logger from "@/lib/logger";
import {
  roles,
  users,
  user_roles,
} from "@/features/authentication_and_authorization/auth/schema";
import {
  ROLE_NAMES,
} from "@/features/authentication_and_authorization/authorization/constants/roles";

const db = create_script_db();

async function main() {
  logger.info("Backfilling customer role for existing users...");

  const [customer_role] = await db
    .select()
    .from(roles)
    .where(sql`${roles.name} = ${ROLE_NAMES.customer}`)
    .limit(1);

  if (!customer_role) {
    logger.error(
      `Customer role "${ROLE_NAMES.customer}" not found. Run seed-rbac.ts first.`,
    );
    process.exit(1);
  }

  const users_with_role = db
    .select({ user_id: user_roles.user_id })
    .from(user_roles)
    .where(sql`${user_roles.role_id} = ${customer_role.id}`)
    .as("users_with_role");

  const users_missing_role = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(
      notInArray(users.id, db.select({ user_id: users_with_role.user_id }).from(users_with_role)),
    );

  if (users_missing_role.length === 0) {
    logger.info("All existing users already have the customer role.");
    process.exit(0);
  }

  logger.info(
    `Found ${users_missing_role.length} user(s) missing the customer role:`,
  );

  for (const user of users_missing_role) {
    await db.insert(user_roles).values({
      user_id: user.id,
      role_id: customer_role.id,
    });
    logger.info(`  ✓ ${user.email} (${user.name ?? "N/A"})`);
  }

  logger.info("Backfill complete.");
  process.exit(0);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
