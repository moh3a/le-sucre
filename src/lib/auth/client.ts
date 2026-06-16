import { createAuthClient } from "better-auth/react";
import { adminClient, customSessionClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), customSessionClient()],
});

export type AuthClient = typeof authClient;
