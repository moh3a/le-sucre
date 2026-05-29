import "server-only";
import { env } from "@/config/env";
import type { PromotionProvider } from "./promotion-provider.interface";
import { local_promotion_provider } from "./local-promotion.provider";

const providers: Record<string, PromotionProvider> = {
  local: local_promotion_provider,
};

export function get_promotion_provider(): PromotionProvider {
  return providers[env.PROMOTION_PROVIDER ?? "local"] ?? local_promotion_provider;
}
