import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as auth_schema from "@/features/authentication_and_authorization/auth/schema";

export function create_script_db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const pool = mysql.createPool(url);
  return drizzle(pool, { schema: { ...auth_schema }, mode: "default" });
}
