import "server-only";
import { generate_id } from "@/lib/utils";
import { db } from "@/lib/db";
import { inventory_forecast_jobs } from "../schema";

export class ForecastIndexService {
  async enqueue(job_type: string, payload: Record<string, unknown>, run_after?: string) {
    await db.insert(inventory_forecast_jobs).values({
      id: generate_id(),
      job_type,
      payload,
      status: "pending",
      run_after: run_after ?? new Date().toISOString(),
    });
  }
}
export const forecast_index_service = new ForecastIndexService();
