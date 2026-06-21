import "dotenv/config";
import { db } from "@/lib/db";
import { permissions } from "@/features/authentication_and_authorization/auth/schema";
import { BLACKLIST_PERMISSIONS } from "@/features/ip_blacklist/constants";
import { logger } from "@/lib/logger";

const BLACKLIST_PERMISSION_NAMES = Object.values(BLACKLIST_PERMISSIONS);

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
