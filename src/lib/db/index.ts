import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/config/env";
import * as auth_schema from "@/features/authentication_and_authorization/auth/schema";

const pool = mysql.createPool(env.DATABASE_URL);
export const db = drizzle(pool, { schema: { ...auth_schema }, mode: "default" });
export type DbClient = typeof db;
