import "server-only";
import { create_trpc_router } from "./router";
import {
  admin_auth_router,
  auth_router,
} from "@/features/authentication_and_authorization/auth/router";
import { category_router } from "@/features/product_information_management/categories/router";
import { product_router } from "@/features/product_information_management/products/router";
import { variants_router } from "@/features/product_information_management/variants/router";
import { inventory_router } from "@/features/inventory_management_system/router";
import { catalog_router } from "@/features/catalog_discovery/router";
import { cart_router } from "@/features/order_management_system/carts/router";
import { checkout_router } from "@/features/order_management_system/checkout/router";
import { order_router } from "@/features/order_management_system/orders/router";
import { reviews_router } from "@/features/product_reviews_management/router";

export const app_router = create_trpc_router({
  auth: auth_router,
  adminAuth: admin_auth_router,
  categories: category_router,
  products: product_router,
  variants: variants_router,
  inventory: inventory_router,
  catalog: catalog_router,
  cart: cart_router,
  checkout: checkout_router,
  orders: order_router,
  reviews: reviews_router
});

export type AppRouter = typeof app_router;
