import { AppError } from "@/lib/error_handling";
import { extract_messages } from "@/features/inventory_management_system/shared/error-codes";
import { redact } from "@/lib/security/redaction";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function app_error_formatter({ shape, error }: any) {
  const cause = error.cause;
  if (cause instanceof AppError) {
    const httpStatus = cause.status_code;
    const messages = extract_messages(cause.details);
    return {
      ...shape,
      message: cause.is_operational ? cause.message : "An error occurred",
      data: {
        ...((shape.data ?? {}) as Record<string, unknown>),
        code: HTTP_TO_TRPC_CODE[httpStatus] ?? "INTERNAL_SERVER_ERROR",
        httpStatus,
        appCode: cause.code,
        details: cause.is_operational ? redact(cause.details) : null,
        messages,
      },
    };
  }
  return shape;
}
