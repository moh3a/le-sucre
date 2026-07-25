import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { database_management_service } from "./service";

export const database_router = create_trpc_router({
  listTables: permission_procedure(PERMISSIONS.settings_read)
    .query(() => database_management_service.list_tables()),

  describeTable: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ table_name: z.string().min(1).max(255) }))
    .query(({ input }) => database_management_service.describe_table(input.table_name)),

  executeQuery: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ query: z.string().min(1) }))
    .mutation(({ input, ctx }) =>
      database_management_service.execute_query(input.query, ctx.user.id)
    ),

  exportTable: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({
      table_name: z.string().min(1).max(255),
      format: z.enum(["csv", "sql", "json"]),
    }))
    .query(({ input, ctx }) =>
      database_management_service.export_table(input.table_name, input.format, ctx.user.id)
    ),

  importSql: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ sql_content: z.string().min(1) }))
    .mutation(({ input, ctx }) =>
      database_management_service.import_sql(input.sql_content, ctx.user.id)
    ),

  importCsv: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({
      table_name: z.string().min(1).max(255),
      csv_content: z.string().min(1),
    }))
    .mutation(({ input, ctx }) =>
      database_management_service.import_csv(input.table_name, input.csv_content, ctx.user.id)
    ),

  history: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(({ input }) => database_management_service.list_history(input?.limit)),

  listJobs: permission_procedure(PERMISSIONS.settings_read)
    .query(() => database_management_service.get_job_definitions()),

  triggerJob: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ job_name: z.string().min(1) }))
    .mutation(({ input, ctx }) =>
      database_management_service.trigger_job(input.job_name, ctx.user.id)
    ),
});
