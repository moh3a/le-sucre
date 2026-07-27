import "server-only";

export type CrmProviderName = "hubspot";

export interface CrmContact {
  id: string;
  phone: string;
  firstname?: string;
  lastname?: string;
  state?: string;
}

export interface SearchContactInput {
  phone: string;
}

export interface UpsertContactInput {
  phone: string;
  firstname: string;
  lastname: string;
  state?: string;
}

export interface CreateDealInput {
  dealname: string;
  amount: number;
  contact_id: string;
  pipeline?: string;
  dealstage?: string;
  order_id?: string;
}

export interface CrmProviderAdapter {
  readonly name: CrmProviderName;

  search_contact_by_phone(input: SearchContactInput): Promise<CrmContact | null>;

  create_contact(input: UpsertContactInput): Promise<CrmContact>;

  update_contact(contact_id: string, input: Partial<UpsertContactInput>): Promise<CrmContact>;

  create_deal_with_association(input: CreateDealInput): Promise<{ deal_id: string }>;
}
