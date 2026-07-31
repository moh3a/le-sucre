export const AUDIT_ACTION = {
  CAMPAIGN_CREATED: "campaign.create",
  CAMPAIGN_UPDATED: "campaign.update",
  CAMPAIGN_STATUS_CHANGED: "campaign.status",
} as const;

export type CampaignAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export function campaign_status_action(status: string) {
  return `campaign.status.${status}` as const;
}
