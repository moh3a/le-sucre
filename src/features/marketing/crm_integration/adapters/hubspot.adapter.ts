import "server-only";
import { logger } from "@/lib/logger";
import type {
  CrmProviderAdapter,
  CrmContact,
  SearchContactInput,
  UpsertContactInput,
  CreateDealInput,
} from "../contracts";

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

export class HubspotCrmAdapter implements CrmProviderAdapter {
  readonly name = "hubspot" as const;

  private get_token(): string {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN is not configured");
    return token;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.get_token()}`,
      "Content-Type": "application/json",
    };
  }

  async search_contact_by_phone(input: SearchContactInput): Promise<CrmContact | null> {
    try {
      const response = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/search`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "phone",
                  operator: "EQ",
                  value: input.phone,
                },
              ],
            },
          ],
          limit: 1,
          properties: ["firstname", "lastname", "phone", "state"],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        logger.warn("HubSpot contact search failed", { status: response.status, body });
        return null;
      }

      const data = (await response.json()) as {
        results?: Array<{
          id: string;
          properties: Record<string, string>;
        }>;
      };

      const result = data.results?.[0];
      if (!result) return null;

      return {
        id: result.id,
        phone: result.properties.phone ?? input.phone,
        firstname: result.properties.firstname ?? undefined,
        lastname: result.properties.lastname ?? undefined,
        state: result.properties.state ?? undefined,
      };
    } catch (err) {
      logger.warn("HubSpot contact search error", { error: (err as Error).message });
      return null;
    }
  }

  async create_contact(input: UpsertContactInput): Promise<CrmContact> {
    const response = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        properties: {
          firstname: input.firstname,
          lastname: input.lastname,
          phone: input.phone,
          state: input.state ?? "",
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HubSpot create contact failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { id: string; properties: Record<string, string> };

    return {
      id: data.id,
      phone: data.properties.phone ?? input.phone,
      firstname: data.properties.firstname ?? input.firstname,
      lastname: data.properties.lastname ?? input.lastname,
      state: data.properties.state ?? input.state,
    };
  }

  async update_contact(
    contact_id: string,
    input: Partial<UpsertContactInput>,
  ): Promise<CrmContact> {
    const properties: Record<string, string> = {};
    if (input.firstname) properties.firstname = input.firstname;
    if (input.lastname) properties.lastname = input.lastname;
    if (input.phone) properties.phone = input.phone;
    if (input.state !== undefined) properties.state = input.state;

    const response = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/contacts/${contact_id}`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HubSpot update contact failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { id: string; properties: Record<string, string> };

    return {
      id: data.id,
      phone: data.properties.phone ?? input.phone ?? "",
      firstname: data.properties.firstname,
      lastname: data.properties.lastname,
      state: data.properties.state,
    };
  }

  async create_deal_with_association(input: CreateDealInput): Promise<{ deal_id: string }> {
    const response = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/deals`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        properties: {
          dealname: input.dealname,
          amount: String(input.amount),
          ...(input.pipeline ? { pipeline: input.pipeline } : {}),
          ...(input.dealstage ? { dealstage: input.dealstage } : {}),
        },
        associations: [
          {
            to: { id: input.contact_id },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 3,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HubSpot create deal failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { id: string };
    return { deal_id: data.id };
  }
}

export const hubspot_adapter = new HubspotCrmAdapter();
