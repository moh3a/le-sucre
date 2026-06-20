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

    CHECKOUT_TAX_RATE: z.coerce.number().min(0).max(1).default(0.19),

    ALLOWED_ORIGINS: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    PAYPAL_WEBHOOK_ID: z.string().optional(),

    YALIDINE_API_URL: z.string().url().optional(),
    YALIDINE_API_TOKEN: z.string().optional(),
    YALIDINE_WEBHOOK_SECRET: z.string().optional(),

    MEDIA_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000/media"),
    MEDIA_STORAGE_ROOT: z.string().default("public/media"),

    RECOMMENDATION_PROVIDER: z.enum(["local"]).default("local"),
    FORECAST_PROVIDER: z.enum(["local"]).default("local"),
    PROMOTION_PROVIDER: z.enum(["local"]).default("local"),

    ANALYTICS_PROVIDER: z.enum(["local"]).default("local"),
    ANALYTICS_RAW_RETENTION_DAYS: z.coerce.number().int().min(7).default(90),
    ANALYTICS_AGGREGATE_RETENTION_DAYS: z.coerce.number().int().min(30).default(730),

    RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
    RATE_LIMIT_REDIS_PREFIX: z.string().default("rl:"),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV === "production" && !v.BETTER_AUTH_SECRET) {
      ctx.addIssue({ code: "custom", message: "BETTER_AUTH_SECRET required in production" });
    }
    if (v.NODE_ENV === "production" && v.ALLOWED_ORIGINS && !v.ALLOWED_ORIGINS.includes(v.BETTER_AUTH_URL)) {
      ctx.addIssue({ code: "custom", message: "ALLOWED_ORIGINS must include BETTER_AUTH_URL in production" });
    }
  });

export const env = env_schema.parse(process.env);
export type AppEnv = z.infer<typeof env_schema>;
