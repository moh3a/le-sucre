import "server-only";

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

export async function create_trpc_context(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: opts.req.headers });
  return { db, redis, session, req: opts.req };
}
export type TrpcContext = Awaited<ReturnType<typeof create_trpc_context>>;
