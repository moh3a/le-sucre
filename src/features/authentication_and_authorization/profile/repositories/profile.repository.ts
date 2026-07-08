import "server-only";

import { eq, and, count, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  user_profiles,
  user_addresses,
} from "@/features/authentication_and_authorization/profile/db/schema";
import type {
  UserProfile,
  UserProfileInsert,
  UserAddress,
} from "@/features/authentication_and_authorization/profile/types";

export class ProfileRepository {
  // ─── User Profile ────────────────────────────────────────────

  async find_by_user_id(user_id: string): Promise<UserProfile | null> {
    const [profile] = await db
      .select()
      .from(user_profiles)
      .where(eq(user_profiles.user_id, user_id))
      .limit(1);
    return profile ?? null;
  }

  async upsert(user_id: string, data: Partial<UserProfileInsert>): Promise<UserProfile> {
    const existing = await this.find_by_user_id(user_id);
    if (existing) {
      await db
        .update(user_profiles)
        .set({ ...data, updated_at: sql`NOW()` })
        .where(eq(user_profiles.user_id, user_id));
      return (await this.find_by_user_id(user_id))!;
    }
    await db.insert(user_profiles).values({ user_id, ...data } as UserProfileInsert);
    return (await this.find_by_user_id(user_id))!;
  }

  async delete(user_id: string): Promise<void> {
    await db.delete(user_profiles).where(eq(user_profiles.user_id, user_id));
  }

  async count_all(): Promise<number> {
    const [row] = await db.select({ total: count() }).from(user_profiles);
    return Number(row?.total ?? 0);
  }

  // ─── User Addresses ──────────────────────────────────────────

  async find_addresses_by_user_id(user_id: string): Promise<UserAddress[]> {
    return db
      .select()
      .from(user_addresses)
      .where(eq(user_addresses.user_id, user_id))
      .orderBy(user_addresses.is_default, user_addresses.created_at);
  }

  async find_address_by_id(id: string, user_id: string): Promise<UserAddress | null> {
    const [address] = await db
      .select()
      .from(user_addresses)
      .where(and(eq(user_addresses.id, id), eq(user_addresses.user_id, user_id)))
      .limit(1);
    return address ?? null;
  }

  async create_address(user_id: string, data: Partial<UserAddress>): Promise<UserAddress> {
    const c = await this.count_addresses(user_id);
    const is_first = c === 0;

    const { id: _id, created_at: _ca, updated_at: _ua, ...insert_data } = data;

    await db.insert(user_addresses).values({
      ...insert_data,
      user_id,
      is_default: is_first ? true : (data.is_default ?? false),
    });

    const [created] = await db
      .select()
      .from(user_addresses)
      .where(and(eq(user_addresses.user_id, user_id), eq(user_addresses.is_default, is_first)))
      .orderBy(sql`RAND()`)
      .limit(1);

    if (created && (is_first || data.is_default)) {
      await this.reset_other_defaults(user_id, created.id);
    }

    return created;
  }

  async update_address(
    id: string,
    user_id: string,
    data: Partial<UserAddress>,
  ): Promise<UserAddress | null> {
    const existing = await this.find_address_by_id(id, user_id);
    if (!existing) return null;

    const { id: _id, created_at: _ca, updated_at: _ua, user_id: _uid, ...update_data } = data;

    await db
      .update(user_addresses)
      .set({ ...update_data, updated_at: sql`NOW()` })
      .where(and(eq(user_addresses.id, id), eq(user_addresses.user_id, user_id)));

    if (data.is_default) {
      await this.reset_other_defaults(user_id, id);
    }

    return (await this.find_address_by_id(id, user_id))!;
  }

  async delete_address(id: string, user_id: string): Promise<boolean> {
    const existing = await this.find_address_by_id(id, user_id);
    if (!existing) return false;

    await db
      .delete(user_addresses)
      .where(and(eq(user_addresses.id, id), eq(user_addresses.user_id, user_id)));

    if (existing.is_default) {
      const remaining = await this.find_addresses_by_user_id(user_id);
      if (remaining.length > 0) {
        const first = remaining[0];
        await db
          .update(user_addresses)
          .set({ is_default: true })
          .where(eq(user_addresses.id, first.id));
      }
    }

    return true;
  }

  async count_addresses(user_id: string): Promise<number> {
    const [row] = await db
      .select({ total: count() })
      .from(user_addresses)
      .where(eq(user_addresses.user_id, user_id));
    return Number(row?.total ?? 0);
  }

  async set_default_address(user_id: string, address_id: string, type: "shipping" | "billing") {
    const address = await this.find_address_by_id(address_id, user_id);
    if (!address) return null;

    const profile_update: Record<string, string> = {};
    if (type === "shipping") {
      profile_update.default_shipping_address_id = address_id;
    } else {
      profile_update.default_billing_address_id = address_id;
    }

    await db
      .update(user_profiles)
      .set({ ...profile_update, updated_at: sql`NOW()` })
      .where(eq(user_profiles.user_id, user_id));

    return address;
  }

  private async reset_other_defaults(user_id: string, except_id: string) {
    await db
      .update(user_addresses)
      .set({ is_default: false })
      .where(and(eq(user_addresses.user_id, user_id), sql`${user_addresses.id} != ${except_id}`));
  }
}

export const profile_repository = new ProfileRepository();
