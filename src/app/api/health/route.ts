import { json_ok } from "@/lib/http";
import { get_health_status } from "@/lib/monitoring/health";

export async function GET() {
  const status = await get_health_status();
  return json_ok(status, status.ok ? 200 : 503);
}
