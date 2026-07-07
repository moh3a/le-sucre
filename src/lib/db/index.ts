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
import * as wishlist_schema from "@/features/wishlist_management_system/schema";
import * as console_schema from "@/features/console_dashboard/tasks/schema";
import * as console_notifications_schema from "@/features/console_dashboard/notifications/schema";
import * as feature_flag_schema from "@/features/feature_flag_system/schema";
import * as media_schema from "@/features/media_library/db/schema";
import * as mfa_schema from "@/features/authentication_and_authorization/auth/mfa_schema";
import * as profile_schema from "@/features/authentication_and_authorization/profile/db/schema";
import * as init_schema from "@/features/init_system/schema";

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
    ...wishlist_schema,
    ...console_schema,
    ...console_notifications_schema,
    ...feature_flag_schema,
    ...media_schema,
    ...mfa_schema,
    ...profile_schema,
    ...init_schema,
  },
  mode: "default",
});

export type DbClient = typeof db;
