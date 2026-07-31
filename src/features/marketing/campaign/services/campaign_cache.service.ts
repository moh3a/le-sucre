import "server-only";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";

const CAMPAIGN_TTL = 60 * 5; // 5 minutes
const HOME_SECTIONS_TTL = 60 * 2; // 2 minutes

export const campaign_cache = {
  async get_active_sections(page_slug: string, locale: string, country: string) {
    const key = redisKeys.campaign.active_sections(page_slug, locale, country);
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  },

  async set_active_sections(page_slug: string, locale: string, country: string, data: unknown) {
    const key = redisKeys.campaign.active_sections(page_slug, locale, country);
    await redis.setex(key, HOME_SECTIONS_TTL, JSON.stringify(data));
  },

  async get_campaign(id: string) {
    const key = redisKeys.campaign.byId(id);
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  },

  async set_campaign(id: string, data: unknown) {
    const key = redisKeys.campaign.byId(id);
    await redis.setex(key, CAMPAIGN_TTL, JSON.stringify(data));
  },

  async invalidate_campaign(id: string) {
    await redis.del(redisKeys.campaign.byId(id));
  },

  async invalidate_all_sections() {
    const pattern = `campaign:sections:*`;
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  },

  async invalidate(id: string) {
    await Promise.all([this.invalidate_campaign(id), this.invalidate_all_sections()]);
  },
};
