import "server-only";
import type { z } from "zod";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { FEATURE_FLAG_ERROR } from "../constants/error-codes";
import { feature_flag_repository } from "../repositories/feature_flag.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { redis } from "@/lib/redis";
import type {
  create_feature_flag_dto,
  update_feature_flag_dto,
  toggle_feature_flag_dto,
  list_feature_flags_dto,
} from "../models/feature_flag.dto";

const CACHE_PREFIX = "feature_flag:";
const CACHE_TTL = 300; // 5 minutes

export class FeatureFlagService {
  private cache_key(key: string) {
    return `${CACHE_PREFIX}${key}`;
  }

  async list(input: z.infer<typeof list_feature_flags_dto>) {
    return feature_flag_repository.list(input.page, input.limit, input.search);
  }

  async stats() {
    return feature_flag_repository.stats();
  }

  async get_by_id(id: string) {
    const flag = await feature_flag_repository.get_by_id(id);
    if (!flag) throw_error(FEATURE_FLAG_ERROR.NOT_FOUND);
    return flag;
  }

  async create(input: z.infer<typeof create_feature_flag_dto>) {
    const existing = await feature_flag_repository.get_by_key(input.key);
    if (existing) throw_error(FEATURE_FLAG_ERROR.KEY_CONFLICT);

    const id = await feature_flag_repository.create(input);
    await this.invalidate_cache(input.key);

    void audit_service.log({
      action: "feature_flag.create",
      resource_type: "feature_flag",
      resource_id: id,
    });

    return feature_flag_repository.get_by_id(id);
  }

  async update(input: z.infer<typeof update_feature_flag_dto>) {
    const existing = await feature_flag_repository.get_by_id(input.id);
    if (!existing) throw_error(FEATURE_FLAG_ERROR.NOT_FOUND);

    const updated = await feature_flag_repository.update(input.id, {
      name: input.name,
      description: input.description,
      enabled: input.enabled,
    });

    await this.invalidate_cache(existing.key);

    void audit_service.log({
      action: "feature_flag.update",
      resource_type: "feature_flag",
      resource_id: input.id,
    });

    return updated;
  }

  async toggle(input: z.infer<typeof toggle_feature_flag_dto>) {
    const existing = await feature_flag_repository.get_by_id(input.id);
    if (!existing) throw_error(FEATURE_FLAG_ERROR.NOT_FOUND);

    const updated = await feature_flag_repository.set_enabled(input.id, input.enabled);
    await this.invalidate_cache(existing.key);

    void audit_service.log({
      action: input.enabled ? "feature_flag.enable" : "feature_flag.disable",
      resource_type: "feature_flag",
      resource_id: input.id,
    });

    return updated;
  }

  async delete(id: string) {
    const existing = await feature_flag_repository.get_by_id(id);
    if (!existing) throw_error(FEATURE_FLAG_ERROR.NOT_FOUND);

    await feature_flag_repository.delete(id);
    await this.invalidate_cache(existing.key);

    void audit_service.log({
      action: "feature_flag.delete",
      resource_type: "feature_flag",
      resource_id: id,
    });
  }

  /**
   * Check if a feature is enabled. Uses Redis cache for fast lookups.
   * This is the primary method used by application code to check feature flags.
   */
  async is_enabled(key: string): Promise<boolean> {
    const cached = await this.get_cached(key);
    if (cached !== null) return cached;

    const flag = await feature_flag_repository.find_enabled_by_key(key);
    const enabled = flag !== null && flag.enabled;

    await this.set_cache(key, enabled);
    return enabled;
  }

  private async get_cached(key: string): Promise<boolean | null> {
    try {
      const val = await redis.get(this.cache_key(key));
      if (val === null) return null;
      return val === "1";
    } catch {
      return null;
    }
  }

  private async set_cache(key: string, enabled: boolean) {
    try {
      await redis.setex(this.cache_key(key), CACHE_TTL, enabled ? "1" : "0");
    } catch {
      // silently fail – cache is non-critical
    }
  }

  private async invalidate_cache(key: string) {
    try {
      await redis.del(this.cache_key(key));
    } catch {
      // silently fail
    }
  }
}

export const feature_flag_service = new FeatureFlagService();
