import "dotenv/config";
import { z } from "zod";

const env_schema = z.object({
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

export const env = env_schema.parse(process.env);
export type AppEnv = z.infer<typeof env_schema>;
