import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/api_response";
import { normalize_error } from "@/lib/error_handling";
import { logger } from "@/lib/logger";

export function json_ok<T>(data: T, status = 200, request_id?: string) {
  return NextResponse.json(ApiResponse.success(data, null, request_id), {
    status,
    headers: request_id ? { "x-request-id": request_id } : undefined,
  });
}

export function json_error(error: unknown, status?: number, request_id?: string) {
  const app_error = normalize_error(error);
  if (app_error.status_code >= 500) {
    logger.error("api_error", {
      code: app_error.code,
      message: app_error.message,
      request_id,
      is_operational: app_error.is_operational,
    });
  } else {
    logger.warn("api_error", {
      code: app_error.code,
      message: app_error.message,
      request_id,
      status: app_error.status_code,
    });
  }
  return NextResponse.json(ApiResponse.error(app_error, request_id), {
    status: status ?? app_error.status_code,
    headers: request_id ? { "x-request-id": request_id } : undefined,
  });
}
