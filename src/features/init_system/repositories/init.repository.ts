import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { system_status } from "../db/schema";

export class InitRepository {
  async get_status() {
    const rows = await db
      .select()
      .from(system_status)
      .where(eq(system_status.id, "singleton"))
      .limit(1);
    return rows[0] ?? null;
  }

  async is_initialized() {
    const row = await this.get_status();
    return row?.initialized ?? false;
  }

  async set_in_progress() {
    const existing = await this.get_status();
    if (existing) {
      await db
        .update(system_status)
        .set({ initialized: false, version: process.env.APP_VERSION ?? "1.0.0" })
        .where(eq(system_status.id, "singleton"));
    } else {
      await db.insert(system_status).values({
        id: "singleton",
        initialized: false,
        version: process.env.APP_VERSION ?? "1.0.0",
      });
    }
  }

  async mark_completed(admin_user_id: string) {
    await db
      .update(system_status)
      .set({
        initialized: true,
        initialized_at: new Date().toISOString(),
        admin_user_id,
        version: process.env.APP_VERSION ?? "1.0.0",
      })
      .where(eq(system_status.id, "singleton"));
  }
}

export const init_repository = new InitRepository();
