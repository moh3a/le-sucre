import "server-only";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";

const HOME_SECTIONS_TTL = 60 * 2; // 2 minutes

export const campaign_cache = {
  async get_active_sections(page_slug: string, locale: string, country: string, user_id: string) {
    const key = redisKeys.campaign.active_sections(page_slug, locale, country, user_id);
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  },

  async set_active_sections(
    page_slug: string,
    locale: string,
    country: string,
    user_id: string,
    data: unknown,
  ) {
    const key = redisKeys.campaign.active_sections(page_slug, locale, country, user_id);
    await redis.setex(key, HOME_SECTIONS_TTL, JSON.stringify(data));
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
