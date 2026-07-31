import "server-only";

import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { settings_repository } from "../repositories/settings.repository";
import { SETTINGS_ERROR } from "../constants/error-codes";
import { APP_NAME } from "@/constants";

const DEFAULTS: Record<string, Record<string, string>> = {
  general: {
    store_name: APP_NAME,
    store_address: "",
    store_phone: "",
    store_vat_number: "",
    currency: "DZD",
    tax_rate: "0.19",
    default_language: "fr",
  },
};

export class SettingsService {
  async get_all() {
    try {
      const rows = await settings_repository.get_all();
      const map: Record<string, Record<string, string>> = {};
      for (const row of rows) {
        if (!map[row.category]) map[row.category] = {};
        map[row.category][row.key] = row.value ?? "";
      }
      const merged: Record<string, Record<string, string>> = {};
      for (const [cat, defaults] of Object.entries(DEFAULTS)) {
        merged[cat] = { ...defaults, ...(map[cat] ?? {}) };
      }
      for (const [cat, vals] of Object.entries(map)) {
        if (!merged[cat]) merged[cat] = vals;
      }
      return merged;
    } catch (error) {
      throw_error(SETTINGS_ERROR.LOAD_FAILED, { cause: error });
    }
  }

  async get_category(category: string) {
    try {
      const rows = await settings_repository.get_by_category(category);
      const map: Record<string, string> = { ...(DEFAULTS[category] ?? {}) };
      for (const row of rows) {
        map[row.key] = row.value ?? "";
      }
      return map;
    } catch (error) {
      throw_error(SETTINGS_ERROR.LOAD_FAILED, { cause: error, category });
    }
  }

  async update_many(
    entries: { key: string; value: string; category: string }[],
    updated_by?: string,
  ) {
    if (!entries.length) {
      throw_error(SETTINGS_ERROR.INVALID_ENTRY);
    }
    try {
      await settings_repository.upsert_many(entries, updated_by);
      return { success: true };
    } catch (error) {
      throw_error(SETTINGS_ERROR.UPDATE_FAILED, { cause: error, entries_count: entries.length });
    }
  }

  async get_env_status() {
    return {
      payments: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: !!process.env.PAYPAL_CLIENT_ID,
      },
      shipping: {
        yalidine: !!process.env.YALIDINE_API_TOKEN,
      },
      redis: !!process.env.REDIS_URL,
      rate_limiting: process.env.RATE_LIMIT_ENABLED !== "false",
      auth: !!process.env.BETTER_AUTH_SECRET,
    };
  }
}

export const settings_service = new SettingsService();
