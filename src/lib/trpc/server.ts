import "server-only";
import { create_trpc_router } from "./router";
import {
  admin_auth_router,
  auth_router,
} from "@/features/authentication_and_authorization/auth/router";

export const app_router = create_trpc_router({
  auth: auth_router,
  adminAuth: admin_auth_router,
});

export type AppRouter = typeof app_router;
