import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { analytics_query_service } from "./services/analytics-query.service";
import { event_ingestion_service } from "./services/event-ingestion.service";
import {
  ingest_event_dto,
  batch_ingest_dto,
  date_range_dto,
  product_analytics_query_dto,
} from "./models/analytics.dto";

export const analytics_router = create_trpc_router({
  track: public_procedure.input(ingest_event_dto).mutation(({ input, ctx }) =>
    event_ingestion_service.track({
      ...input,
      user_id: ctx.session?.user?.id ?? null,
    }),
  ),

  trackBatch: public_procedure
    .input(batch_ingest_dto)
    .mutation(({ input, ctx }) =>
      event_ingestion_service.track_batch(input.events, ctx.session?.user?.id ?? null),
    ),

  overview: permission_procedure(PERMISSIONS.analytics_read)
    .input(date_range_dto)
    .query(({ input }) => analytics_query_service.overview(input)),

  products: permission_procedure(PERMISSIONS.analytics_read)
    .input(product_analytics_query_dto)
    .query(({ input }) => analytics_query_service.products(input)),

  realtime: permission_procedure(PERMISSIONS.analytics_read).query(() =>
    analytics_query_service.realtime(),
  ),
});
