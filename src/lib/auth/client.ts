import { createAuthClient } from "better-auth/react";
import { adminClient, customSessionClient } from "better-auth/client/plugins";
import type { AuthInstance } from "./index";

export const authClient = createAuthClient({
  plugins: [adminClient(), customSessionClient<AuthInstance>()],
});

export type AuthClient = typeof authClient;
