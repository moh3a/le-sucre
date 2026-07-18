import "server-only";
import { and, eq, like, lte, isNull, or, sql, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";
import { blacklisted_ips, type BlacklistedIp, type NewBlacklistedIp } from "@/features/ip_blacklist/schema";
import { BLACKLIST_CACHE_TTL, BLACKLIST_PAGINATION } from "@/features/ip_blacklist/constants";
import { NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";

export class IpBlacklistService {
  async is_blacklisted(ip_address: string): Promise<boolean> {
    const cache_key = redisKeys.blacklist.byIp(ip_address);
    const cached = await redis.get(cache_key);
    if (cached === "1") return true;
    if (cached === "0") return false;

    const entry = await db
      .select({ id: blacklisted_ips.id })
      .from(blacklisted_ips)
      .where(
        and(
          eq(blacklisted_ips.ip_address, ip_address),
          eq(blacklisted_ips.is_active, true),
          or(
            isNull(blacklisted_ips.expires_at),
            sql`${blacklisted_ips.expires_at} > NOW()`,
          ),
        ),
      )
      .limit(1);

    const blocked = entry.length > 0;
    await redis.setex(cache_key, BLACKLIST_CACHE_TTL, blocked ? "1" : "0");
    return blocked;
  }

  async add(data: {
    ip_address: string;
    reason?: string | null;
    reason_fr?: string | null;
    reason_ar?: string | null;
    created_by: string;
    expires_at?: Date | string | null;
  }): Promise<BlacklistedIp> {
    const expires = data.expires_at ? new Date(data.expires_at) : null;

    const [existing] = await db
      .select()
      .from(blacklisted_ips)
      .where(eq(blacklisted_ips.ip_address, data.ip_address))
      .limit(1);

    if (existing) {
      await db
        .update(blacklisted_ips)
        .set({
          is_active: true,
          reason: data.reason ?? existing.reason,
          reason_fr: data.reason_fr ?? existing.reason_fr,
          reason_ar: data.reason_ar ?? existing.reason_ar,
          expires_at: expires ?? existing.expires_at,
          created_by: data.created_by,
          updated_at: sql`NOW(3)`,
        })
        .where(eq(blacklisted_ips.id, existing.id));

      await this._invalidate_cache(data.ip_address);
      return { ...existing, ...data, expires_at: expires ?? existing.expires_at, updated_at: new Date().toISOString() };
    }

    const id = generate_id();
    const now = new Date().toISOString();
    const entry: NewBlacklistedIp = {
      id,
      ip_address: data.ip_address,
      reason: data.reason ?? null,
      reason_fr: data.reason_fr ?? null,
      reason_ar: data.reason_ar ?? null,
      is_active: true,
      expires_at: expires ?? null,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    };

    await db.insert(blacklisted_ips).values(entry);
    await this._invalidate_cache(data.ip_address);

    return entry as BlacklistedIp;
  }

  async remove(id: string): Promise<void> {
    const [entry] = await db
      .select()
      .from(blacklisted_ips)
      .where(eq(blacklisted_ips.id, id))
      .limit(1);

    if (!entry) throw new NotFoundError("Blacklist entry not found");

    await db.delete(blacklisted_ips).where(eq(blacklisted_ips.id, id));
    await this._invalidate_cache(entry.ip_address);
  }

  async toggle(id: string): Promise<BlacklistedIp> {
    const [entry] = await db
      .select()
      .from(blacklisted_ips)
      .where(eq(blacklisted_ips.id, id))
      .limit(1);

    if (!entry) throw new NotFoundError("Blacklist entry not found");

    const new_active = !entry.is_active;
    await db
      .update(blacklisted_ips)
      .set({ is_active: new_active, updated_at: sql`NOW(3)` })
      .where(eq(blacklisted_ips.id, id));

    await this._invalidate_cache(entry.ip_address);
    return { ...entry, is_active: new_active, updated_at: new Date().toISOString() };
  }

  async update(
    id: string,
    data: {
      reason?: string | null;
      reason_fr?: string | null;
      reason_ar?: string | null;
      is_active?: boolean;
      expires_at?: string | Date | null;
    },
  ): Promise<BlacklistedIp> {
    const [entry] = await db
      .select()
      .from(blacklisted_ips)
      .where(eq(blacklisted_ips.id, id))
      .limit(1);

    if (!entry) throw new NotFoundError("Blacklist entry not found");

    const update_data: Record<string, unknown> = { updated_at: sql`NOW(3)` };
    if (data.reason !== undefined) update_data.reason = data.reason;
    if (data.reason_fr !== undefined) update_data.reason_fr = data.reason_fr;
    if (data.reason_ar !== undefined) update_data.reason_ar = data.reason_ar;
    if (data.is_active !== undefined) update_data.is_active = data.is_active;
    if (data.expires_at !== undefined) {
      update_data.expires_at = data.expires_at ? new Date(data.expires_at) : null;
    }

    await db
      .update(blacklisted_ips)
      .set(update_data)
      .where(eq(blacklisted_ips.id, id));

    await this._invalidate_cache(entry.ip_address);
    return { ...entry, ...update_data, updated_at: new Date().toISOString() } as BlacklistedIp;
  }

  async get_by_id(id: string): Promise<BlacklistedIp> {
    const [entry] = await db
      .select()
      .from(blacklisted_ips)
      .where(eq(blacklisted_ips.id, id))
      .limit(1);

    if (!entry) throw new NotFoundError("Blacklist entry not found");
    return entry;
  }

  async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<{ entries: BlacklistedIp[]; total: number; page: number; limit: number; total_pages: number }> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? BLACKLIST_PAGINATION.default_limit, BLACKLIST_PAGINATION.max_limit);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.search) {
      conditions.push(
        or(
          like(blacklisted_ips.ip_address, `%${params.search}%`),
          like(blacklisted_ips.reason, `%${params.search}%`),
          like(blacklisted_ips.reason_fr, `%${params.search}%`),
        ),
      );
    }

    if (params.is_active !== undefined) {
      conditions.push(eq(blacklisted_ips.is_active, params.is_active));
    }

    const where_clause = conditions.length > 0 ? and(...conditions) : undefined;

    const [entries, count_result] = await Promise.all([
      db
        .select()
        .from(blacklisted_ips)
        .where(where_clause)
        .orderBy(desc(blacklisted_ips.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(blacklisted_ips)
        .where(where_clause),
    ]);

    const total = Number(count_result[0]?.count ?? 0);

    return {
      entries,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async expire_old_entries(): Promise<number> {
    const result = await db
      .update(blacklisted_ips)
      .set({ is_active: false, updated_at: sql`NOW(3)` })
      .where(
        and(
          eq(blacklisted_ips.is_active, true),
          lte(blacklisted_ips.expires_at, sql`NOW()`),
        ),
      );

    const affected = result?.[0]?.affectedRows ?? 0;

    if (affected > 0) {
      const expired = await db
        .select({ ip_address: blacklisted_ips.ip_address })
        .from(blacklisted_ips)
        .where(
          and(
            eq(blacklisted_ips.is_active, false),
            lte(blacklisted_ips.expires_at, sql`NOW()`),
          ),
        );

      const pipeline = redis.pipeline();
      for (const entry of expired) {
        pipeline.del(redisKeys.blacklist.byIp(entry.ip_address));
      }
      await pipeline.exec();
    }

    return affected;
  }

  async stats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expiring_soon: number;
  }> {
    const [total_result, active_result, inactive_result, expiring_result] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(blacklisted_ips),
      db.select({ count: sql<number>`COUNT(*)` }).from(blacklisted_ips).where(eq(blacklisted_ips.is_active, true)),
      db.select({ count: sql<number>`COUNT(*)` }).from(blacklisted_ips).where(eq(blacklisted_ips.is_active, false)),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(blacklisted_ips)
        .where(
          and(
            eq(blacklisted_ips.is_active, true),
            sql`${blacklisted_ips.expires_at} > NOW()`,
            sql`${blacklisted_ips.expires_at} <= DATE_ADD(NOW(), INTERVAL 7 DAY)`,
          ),
        ),
    ]);

    return {
      total: Number(total_result[0]?.count ?? 0),
      active: Number(active_result[0]?.count ?? 0),
      inactive: Number(inactive_result[0]?.count ?? 0),
      expiring_soon: Number(expiring_result[0]?.count ?? 0),
    };
  }

  async _invalidate_cache(ip_address: string): Promise<void> {
    await redis.del(redisKeys.blacklist.byIp(ip_address));
  }
}

export const ip_blacklist_service = new IpBlacklistService();
