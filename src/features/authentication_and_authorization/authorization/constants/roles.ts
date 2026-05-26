export const ROLE_NAMES = {
  admin: "admin",
  moderator: "moderator",
  operator: "operator",
  delivery_person: "delivery_person",
  customer: "customer",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export const STAFF_ROLES: RoleName[] = [
  ROLE_NAMES.admin,
  ROLE_NAMES.moderator,
  ROLE_NAMES.operator,
  ROLE_NAMES.delivery_person,
];

export const ADMIN_CONSOLE_ROLES: RoleName[] = [
  ROLE_NAMES.admin,
  ROLE_NAMES.moderator,
  ROLE_NAMES.operator,
];
