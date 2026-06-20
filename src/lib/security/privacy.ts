import "server-only";

import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { consent_logs } from "@/features/authentication_and_authorization/auth/mfa_schema";
import {
  DATA_RETENTION_DAYS,
  get_retention_date,
  CONSENT_TYPES,
  type ConsentType,
} from "./compliance";
import { generate_id } from "@/lib/utils";

export class PrivacyComplianceService {
  async record_consent(
    user_id: string,
    consent_type: ConsentType,
    granted: boolean,
    ip_address?: string,
    user_agent?: string,
  ): Promise<void> {
    await db.insert(consent_logs).values({
      id: generate_id(),
      user_id,
      consent_type,
      granted,
      ip_address: ip_address ?? null,
      user_agent: user_agent ?? null,
    });
  }

  async get_consent_history(
    user_id: string,
  ): Promise<Array<{ consent_type: string; granted: boolean; created_at: string }>> {
    const logs = await db
      .select({
        consent_type: consent_logs.consent_type,
        granted: consent_logs.granted,
        created_at: consent_logs.created_at,
      })
      .from(consent_logs)
      .where(eq(consent_logs.user_id, user_id))
      .orderBy(consent_logs.created_at);

    return logs;
  }

  async get_latest_consent(user_id: string): Promise<Record<string, boolean>> {
    const logs = await this.get_consent_history(user_id);
    const latest: Record<string, boolean> = {};
    for (const log of logs) {
      latest[log.consent_type] = log.granted;
    }
    return latest;
  }

  async export_user_data(user_id: string): Promise<Record<string, unknown>> {
    const user_rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        created_at: users.created_at,
        email_verified: users.email_verified,
      })
      .from(users)
      .where(eq(users.id, user_id))
      .limit(1);

    if (user_rows.length === 0) throw new Error("User not found");

    const consents = await this.get_consent_history(user_id);

    return {
      user: user_rows[0],
      consents,
      export_date: new Date().toISOString(),
    };
  }

  async schedule_anonymization(user_id: string): Promise<void> {
    const anonymized_name = `deleted_user_${user_id.substring(0, 8)}`;
    const anonymized_email = `deleted_${user_id.substring(0, 8)}@anon.local`;

    await db
      .update(users)
      .set({
        name: anonymized_name,
        email: anonymized_email,
        is_active: false,
        image: null,
      })
      .where(eq(users.id, user_id));
  }

  async get_retention_status(): Promise<
    Array<{ category: string; retention_days: number; cutoff_date: string }>
  > {
    return Object.entries(DATA_RETENTION_DAYS).map(([category, days]) => ({
      category,
      retention_days: days,
      cutoff_date: get_retention_date(days).toISOString(),
    }));
  }
}

export const privacy_compliance_service = new PrivacyComplianceService();
