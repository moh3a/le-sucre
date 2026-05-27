import "server-only";
import { create_trpc_router } from "./router";
import {
  admin_auth_router,
  auth_router,
} from "@/features/authentication_and_authorization/auth/router";
import { category_router } from "@/features/product_information_management/categories/router";
import { product_router } from "@/features/product_information_management/products/router";

export const app_router = create_trpc_router({
  auth: auth_router,
  adminAuth: admin_auth_router,
  categories: category_router,
  products: product_router
});

export type AppRouter = typeof app_router;
