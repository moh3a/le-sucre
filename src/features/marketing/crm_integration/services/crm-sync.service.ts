import "server-only";
import { logger } from "@/lib/logger";
import { get_crm_provider } from "../provider-registry";

export interface CrmSyncOrderInput {
  order_id: string;
  order_number: string;
  grand_total: number | string;
  shipping_address: {
    full_name: string;
    phone: string;
    state?: string | null;
    city?: string;
  };
  guest_phone?: string | null;
  user_id?: string | null;
}

function split_name(full_name: string): { firstname: string; lastname: string } {
  const parts = full_name.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

class CrmSyncService {
  async sync_order_to_crm(input: CrmSyncOrderInput): Promise<void> {
    const provider = get_crm_provider();
    if (!provider) return;

    const phone = input.shipping_address.phone || input.guest_phone;
    if (!phone) {
      logger.warn("CRM sync skipped: no phone number", { order_id: input.order_id });
      return;
    }

    try {
      const { firstname, lastname } = split_name(input.shipping_address.full_name);

      const existing = await provider.search_contact_by_phone({ phone });

      let contact_id: string;

      if (existing) {
        await provider.update_contact(existing.id, {
          firstname,
          lastname,
          state: input.shipping_address.state ?? undefined,
        });
        contact_id = existing.id;
      } else {
        const contact = await provider.create_contact({
          phone,
          firstname,
          lastname,
          state: input.shipping_address.state ?? undefined,
        });
        contact_id = contact.id;
      }

      await provider.create_deal_with_association({
        dealname: `#${input.order_number}`,
        amount: Number(input.grand_total),
        contact_id,
        order_id: input.order_id,
      });

      logger.info("CRM sync completed", {
        provider: provider.name,
        order_id: input.order_id,
        contact_id,
      });
    } catch (err) {
      logger.warn("CRM sync failed", {
        provider: provider.name,
        order_id: input.order_id,
        error: (err as Error).message,
      });
    }
  }
}

export const crm_sync_service = new CrmSyncService();
