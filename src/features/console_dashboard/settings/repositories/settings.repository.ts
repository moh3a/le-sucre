import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { settings } from "../schema";

export class SettingsRepository {
  async get(key: string) {
    const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return row ?? null;
  }

  async get_by_category(category: string) {
    return db.select().from(settings).where(eq(settings.category, category)).orderBy(settings.key);
  }

  async get_all() {
    return db.select().from(settings).orderBy(settings.category, settings.key);
  }

  async upsert(key: string, value: string, category: string, updated_by?: string) {
    const existing = await this.get(key);
    if (existing) {
      return db.update(settings).set({ value, updated_by }).where(eq(settings.key, key));
    }
    return db.insert(settings).values({ key, value, category, updated_by });
  }

  async upsert_many(
    entries: { key: string; value: string; category: string }[],
    updated_by?: string,
  ) {
    for (const entry of entries) {
      await this.upsert(entry.key, entry.value, entry.category, updated_by);
    }
  }

  async delete(key: string) {
    return db.delete(settings).where(eq(settings.key, key));
  }
}

export const settings_repository = new SettingsRepository();
