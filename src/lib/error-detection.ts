export function extract_error_message(error: unknown): string {
  if (!error) return "";
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    if (typeof err.message === "string") return err.message;

    const data = err.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
      if (d.messages && typeof d.messages === "object") {
        const msgs = d.messages as Record<string, string>;
        const first = Object.values(msgs)[0];
        if (typeof first === "string") return first;
      }
    }
  }

  return "";
}

export function is_timeout_error(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof Error && error.message === "REQUEST_TIMEOUT") return true;

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (err.message === "REQUEST_TIMEOUT") return true;

    const data = err.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.httpStatus === "number" && (d.httpStatus === 408 || d.httpStatus === 504))
        return true;
      if (d.code === "TIMEOUT") return true;
    }
  }

  return false;
}

export function is_backend_unavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;
  const data = err.data;

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.httpStatus === "number") {
      if (d.httpStatus === 502 || d.httpStatus === 503 || d.httpStatus === 504) return true;
    }
    if (typeof d.code === "string") {
      if (
        d.code === "BAD_GATEWAY" ||
        d.code === "SERVICE_UNAVAILABLE" ||
        d.code === "GATEWAY_TIMEOUT"
      )
        return true;
    }
  }

  return false;
}

export function is_unauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;
  const data = err.data;

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.code === "UNAUTHORIZED") return true;
    if (d.httpStatus === 401) return true;
  }

  return false;
}
