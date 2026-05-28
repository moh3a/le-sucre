import "dotenv/config";
import { z } from "zod";

const env_schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

    DATABASE_URL: z.string().min(1),
    DATABASE_READ_URL: z.string().min(1).optional(),

    REDIS_URL: z.string().min(1),

    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),

    // SENTRY_DSN: z.string().url().optional(),
    // SENTRY_ENVIRONMENT: z.string().optional(),

    // YALIDINE_API_URL: z.string().url().optional(),
    // YALIDINE_API_TOKEN: z.string().optional(),
    // YALIDINE_WEBHOOK_SECRET: z.string().optional(),

    CHECKOUT_TAX_RATE: z.coerce.number().min(0).max(1).default(0.19),

    // NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
    // MEDIA_UPLOAD_DIR: z.string().default("public/media"),

    // TRUST_PROXY: z.coerce.boolean().default(true),
    // RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(60),
    // RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

    RECOMMENDATION_PROVIDER: z.enum(["local"]).default("local"),
    FORECAST_PROVIDER: z.enum(["local"]).default("local"),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV === "production" && !v.BETTER_AUTH_SECRET) {
      ctx.addIssue({ code: "custom", message: "BETTER_AUTH_SECRET required in production" });
    }
  });

export const env = env_schema.parse(process.env);
export type AppEnv = z.infer<typeof env_schema>;
