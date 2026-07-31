import "server-only";
import type { CrmProviderAdapter, CrmProviderName } from "./contracts";
import { hubspot_adapter } from "./adapters/hubspot.adapter";
import { env } from "@/config/env";

const providers: Map<CrmProviderName, CrmProviderAdapter> = new Map();

export function register_crm_provider(adapter: CrmProviderAdapter): void {
  providers.set(adapter.name, adapter);
}

export function get_crm_provider(): CrmProviderAdapter | null {
  const name = env.CRM_PROVIDER as CrmProviderName | "none";
  if (name === "none") return null;
  const adapter = providers.get(name);
  if (!adapter) return null;
  return adapter;
}

register_crm_provider(hubspot_adapter);
