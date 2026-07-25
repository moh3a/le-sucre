export const AUDIT_ACTION = {
  ADMIN_TASK_CREATED: "admin_task.created",
  ADMIN_TASK_UPDATED: "admin_task.updated",
  ADMIN_TASK_ASSIGNED: "admin_task.assigned",
  ADMIN_TASK_STARTED: "admin_task.started",
  ADMIN_TASK_COMPLETED: "admin_task.completed",
  ADMIN_TASK_CANCELLED: "admin_task.cancelled",
} as const;

export type ConsoleDashboardAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
