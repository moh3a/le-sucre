import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const TASK_ERROR = {
  TASK_NOT_FOUND: { code: "TASK_NOT_FOUND", status: 404, message: { fr: "Tâche introuvable", en: "Task not found", ar: "لم يتم العثور على المهمة" } },
} as const satisfies Record<string, ErrorDef>;
