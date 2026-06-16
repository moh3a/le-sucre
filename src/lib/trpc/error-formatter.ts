import { AppError } from "@/lib/error_handling";
import { extract_messages } from "@/features/inventory_management_system/shared/error-codes";

const HTTP_TO_TRPC_CODE: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_CONTENT",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

export function app_error_formatter({ shape, error }: { shape: Record<string, unknown>; error: { cause?: unknown; message?: string } }) {
  const cause = error.cause;
  if (cause instanceof AppError) {
    const httpStatus = cause.status_code;
    const messages = extract_messages(cause.details);
    return {
      ...shape,
      message: cause.message,
      data: {
        ...((shape.data ?? {}) as Record<string, unknown>),
        code: HTTP_TO_TRPC_CODE[httpStatus] ?? "INTERNAL_SERVER_ERROR",
        httpStatus,
        appCode: cause.code,
        details: cause.details,
        messages,
      },
    };
  }
  return shape;
}
