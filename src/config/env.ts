import "dotenv/config";
import { z } from "zod";
import { logger } from "@/lib/logger";

const env_schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

    DATABASE_URL: z.string().min(1),
    DATABASE_READ_URL: z.string().min(1).optional(),

    REDIS_URL: z.string().min(1),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_TLS_ENABLED: z.coerce.boolean().default(false),

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

    SESSION_MAX_CONCURRENT: z.coerce.number().int().positive().default(10),
    SESSION_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(240),
    SESSION_ABSOLUTE_TIMEOUT_HOURS: z.coerce.number().int().positive().default(168),

    LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
    LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
    LOGIN_CAPTCHA_AFTER: z.coerce.number().int().positive().default(3),

    FILE_UPLOAD_MAX_SIZE_MB: z.coerce.number().int().positive().default(50),
    FILE_UPLOAD_MAX_FILES: z.coerce.number().int().positive().default(10),
  })
  .superRefine((v, ctx) => {
    if (v.NODE_ENV === "production" && !v.BETTER_AUTH_SECRET) {
      ctx.addIssue({ code: "custom", message: "BETTER_AUTH_SECRET required in production" });
    }
    if (v.NODE_ENV === "production" && v.ALLOWED_ORIGINS && !v.ALLOWED_ORIGINS.includes(v.BETTER_AUTH_URL)) {
      ctx.addIssue({ code: "custom", message: "ALLOWED_ORIGINS must include BETTER_AUTH_URL in production" });
    }
    if (v.NODE_ENV === "production" && v.REDIS_TLS_ENABLED && !v.REDIS_URL.startsWith("rediss://")) {
      ctx.addIssue({ code: "custom", message: "REDIS_URL must use rediss:// when REDIS_TLS_ENABLED=true" });
    }
  });

let parsed: z.infer<typeof env_schema>;

try {
  parsed = env_schema.parse(process.env);
} catch (err) {
  if (err instanceof z.ZodError) {
    for (const issue of err.issues) {
      logger.error(`Environment validation failed: ${issue.message} (path: ${issue.path.join(".")})`);
    }
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    logger.warn("Using fallback defaults for development due to env validation errors");
    parsed = env_schema.partial().parse(process.env) as z.infer<typeof env_schema>;
  } else {
    throw err;
  }
}

export const env = parsed;
export type AppEnv = z.infer<typeof env_schema>;
