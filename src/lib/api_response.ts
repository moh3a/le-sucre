import { AppError } from "./error_handling";

export interface PaginationMeta {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  has_more: boolean;
}

export interface ApiResponseEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
  } | null;
  meta: {
    pagination?: PaginationMeta;
    timestamp: string;
    request_id?: string;
  };
}

export class ApiResponse {
  /**
   * Generates a successful standardized response envelope.
   */
  public static success<T>(
    data: T,
    pagination: PaginationMeta | null = null,
    request_id?: string
  ): ApiResponseEnvelope<T> {
    return {
      success: true,
      data,
      error: null,
      meta: {
        ...(pagination && { pagination }),
        timestamp: new Date().toISOString(),
        ...(request_id && { request_id }),
      },
    };
  }

  /**
   * Generates an error standardized response envelope from an AppError instance.
   */
  public static error(
    error: AppError,
    request_id?: string
  ): ApiResponseEnvelope<null> {
    return {
      success: false,
      data: null,
      error: {
        code: error.code,
        message: error.is_operational ? error.message : "A internal server error occurred",
        details: error.is_operational ? error.details : null,
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(request_id && { request_id }),
      },
    };
  }
}
