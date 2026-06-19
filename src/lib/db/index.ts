import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/config/env";
import * as auth_schema from "@/features/authentication_and_authorization/auth/schema";
import * as pim_schema from "@/features/product_information_management/schema";
import * as inventory_schema from "@/features/inventory_management_system/inventory/schema";
import * as order_schema from "@/features/order_management_system/schema";
import * as shipping_schema from "@/features/shipping_management_system/schema";
import * as analytics_schema from "@/features/analytics_management_system/schema";
import * as reviews_schema from "@/features/product_reviews_management/schema";
import * as billing_schema from "@/features/billing_and_finance_system/db/schema";
import * as campaign_schema from "@/features/campaign_management_system/schema";
import * as payment_schema from "@/features/payment_management_system/db/schema";

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  // connectionLimit: 30,
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
    ...analytics_schema,
    ...reviews_schema,
    ...billing_schema,
    ...campaign_schema,
    ...payment_schema,
  },
  mode: "default",
});

export type DbClient = typeof db;
