import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/api_response";
import { normalize_error } from "@/lib/error_handling";
import { logger } from "@/lib/logger";

export function json_ok<T>(data: T, status = 200, request_id?: string) {
  return NextResponse.json(ApiResponse.success(data, null, request_id), { status });
}

export function json_error(error: unknown, request_id?: string) {
  const app_error = normalize_error(error);
  logger.error("api_error", { code: app_error.code, message: app_error.message });
  return NextResponse.json(ApiResponse.error(app_error, request_id), {
    status: app_error.status_code,
  });
}
