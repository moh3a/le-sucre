import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/features/**/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "mysql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
