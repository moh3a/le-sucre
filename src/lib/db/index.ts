import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/config/env";
import * as auth_schema from "@/features/authentication_and_authorization/auth/schema";
import * as pim_schema from "@/features/product_information_management/schema";
import * as inventory_schema from "@/features/inventory_management_system/inventory/schema";
import * as order_schema from "@/features/order_management_system/schema";
import * as shipping_schema from "@/features/shipping_management_system/schema";

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 30,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
});

export const db = drizzle(pool, {
  schema: {
    ...auth_schema,
    ...pim_schema,
    ...inventory_schema,
    ...order_schema,
    ...shipping_schema,
  },
  mode: "default",
});

export type DbClient = typeof db;
