export const AUDIT_ACTION = {
  AUTH_REGISTER_CUSTOMER: "auth.register.customer",
  AUTH_STAFF_ROLE_ASSIGNED: "auth.staff_role.assigned",
  AUTH_LOGIN_SUCCESS: "auth.login.success",
  AUTH_LOGIN_FAILURE: "auth.login.failure",
  AUTH_LOGOUT: "auth.logout",
  PROFILE_INITIALIZED: "profile.initialized",
  PROFILE_UPDATED: "profile.updated",
  ADDRESS_CREATED: "address.created",
  ADDRESS_UPDATED: "address.updated",
  ADDRESS_DELETED: "address.deleted",
  ADDRESS_SET_DEFAULT: "address.set_default",
  ROLE_PERMISSIONS_UPDATED: "role.permissions.updated",
} as const;

export type AuthAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
