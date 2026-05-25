import "server-only";
import { create_trpc_router } from "./router";

export const app_router = create_trpc_router({});
export type AppRouter = typeof app_router;
