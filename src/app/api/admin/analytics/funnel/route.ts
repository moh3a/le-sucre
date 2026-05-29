import { json_ok, json_error } from "@/lib/http";
import { date_range_dto } from "@/features/analytics_management_system/models/analytics.dto";
import { analytics_query_service } from "@/features/analytics_management_system/services/analytics-query.service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = date_range_dto.safeParse({
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });
    if (!parsed.success) throw new Error("Validation échouée");
    const data = await analytics_query_service.realtime();
    return json_ok(data);
  } catch (e) {
    return json_error(e);
  }
}
