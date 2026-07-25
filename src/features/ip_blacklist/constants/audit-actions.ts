export const AUDIT_ACTION = {
  IP_ADDED_TO_BLACKLIST: "ip_blacklist.added",
  IP_REMOVED_FROM_BLACKLIST: "ip_blacklist.removed",
  IP_BLACKLIST_TOGGLED: "ip_blacklist.toggled",
  IP_BLACKLIST_UPDATED: "ip_blacklist.updated",
  IP_BLACKLIST_ENTRIES_EXPIRED: "ip_blacklist.entries_expired",
} as const;

export type IpBlacklistAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
