import "server-only";
import { create_trpc_router } from "./router";
import {
  admin_auth_router,
  auth_router,
} from "@/features/authentication_and_authorization/auth/router";
import { authorization_router } from "@/features/authentication_and_authorization/authorization/router";
import { category_router } from "@/features/product_information_management/categories/router";
import { product_router } from "@/features/product_information_management/products/router";
import { variants_router } from "@/features/product_information_management/variants/router";
import { catalog_router } from "@/features/product_information_management/catalog_discovery/router";
import { recommendations_router } from "@/features/product_information_management/recommendations/router";
import { reviews_router } from "@/features/product_reviews_management/router";
import { inventory_router } from "@/features/inventory_management_system/inventory/router";
import { forecast_router } from "@/features/inventory_management_system/forecasting/router";
import { warehouse_router } from "@/features/inventory_management_system/warehouses/router";
import { cart_router } from "@/features/order_management_system/carts/router";
import { checkout_router } from "@/features/order_management_system/checkout/router";
import { order_router } from "@/features/order_management_system/orders/router";
import { preorder_router } from "@/features/order_management_system/preorders/router";
import { customers_router } from "@/features/order_management_system/customers/router";
import { promotion_router } from "@/features/order_management_system/promotions/router";
import { analytics_router } from "@/features/analytics_management_system/router";
import { shipping_router } from "@/features/shipping_management_system/router";
import { invoice_router } from "@/features/billing_and_finance_system/routers/invoice.router";
import { campaign_router } from "@/features/campaign_management_system/router";

export const app_router = create_trpc_router({
  auth: auth_router,
  authorization: authorization_router,
  adminAuth: admin_auth_router,
  categories: category_router,
  products: product_router,
  variants: variants_router,
  recommendations: recommendations_router,
  catalog: catalog_router,
  reviews: reviews_router,
  inventory: inventory_router,
  forecast: forecast_router,
  warehouses: warehouse_router,
  cart: cart_router,
  checkout: checkout_router,
  orders: order_router,
  preorders: preorder_router,
  customers: customers_router,
  promotions: promotion_router,
  analytics: analytics_router,
  shipping: shipping_router,
  invoices: invoice_router,
  campaigns: campaign_router,
});

export type AppRouter = typeof app_router;
