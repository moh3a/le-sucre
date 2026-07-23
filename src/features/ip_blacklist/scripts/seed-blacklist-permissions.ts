import "dotenv/config";
import { db } from "@/lib/db";
import { permissions } from "@/features/authentication_and_authorization/auth/schema";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { logger } from "@/lib/logger";

const BLACKLIST_PERMISSION_NAMES = [
  PERMISSIONS.blacklist_view,
  PERMISSIONS.blacklist_create,
  PERMISSIONS.blacklist_update,
  PERMISSIONS.blacklist_delete,
];

async function seed_blacklist_permissions() {
  logger.info("Seeding blacklist permissions…");

  for (const name of BLACKLIST_PERMISSION_NAMES) {
    await db
      .insert(permissions)
      .values({
        id: undefined,
        name,
        description: `Blacklist ${name.split(":")[1]}`,
      })
      .onDuplicateKeyUpdate({ set: { name } });
  }

  logger.info("Blacklist permissions seeded successfully", {
    count: BLACKLIST_PERMISSION_NAMES.length,
  });
  process.exit(0);
}

seed_blacklist_permissions().catch((err) => {
  logger.error("Failed to seed blacklist permissions", { err });
  process.exit(1);
});
