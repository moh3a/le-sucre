import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { demand_forecast_service } from "./services/demand-forecast.service";
import { forecast_analytics_queries } from "./analytics/forecast-analytics.queries";
import { alert_repository } from "./repositories/alert.repository";

export const forecast_router = create_trpc_router({
  bySku: permission_procedure(PERMISSIONS.inventory_forecast_read)
    .input(z.object({ sku_id: z.string(), warehouse_id: z.string().default("default") }))
    .query(({ input }) =>
      demand_forecast_service.get_sku_forecast(input.sku_id, input.warehouse_id),
    ),

  dashboard: permission_procedure(PERMISSIONS.inventory_forecast_read)
    .input(
      z.object({
        risk_level: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(({ input }) => forecast_analytics_queries.dashboard(input)),

  alerts: permission_procedure(PERMISSIONS.inventory_forecast_read)
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(({ input }) => alert_repository.list(input)),

  ackAlert: permission_procedure(PERMISSIONS.inventory_forecast_write)
    .input(z.object({ id: z.string().min(1).max(255) }))
    .mutation(({ input }) => alert_repository.ack(input.id)),

  resolveAlert: permission_procedure(PERMISSIONS.inventory_forecast_write)
    .input(z.object({ id: z.string().min(1).max(255) }))
    .mutation(({ input }) => alert_repository.resolve(input.id)),
});
