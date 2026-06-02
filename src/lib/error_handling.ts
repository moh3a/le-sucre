export class AppError extends Error {
  public readonly code: string;
  public readonly status_code: number;
  public readonly details: Record<string, unknown> | null;
  public readonly is_operational: boolean;

  constructor(
    message: string,
    code = "INTERNAL_SERVER_ERROR",
    status_code = 500,
    details: Record<string, unknown> | null = null,
    is_operational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status_code = status_code;
    this.details = details;
    this.is_operational = is_operational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details: Record<string, unknown> | null = null) {
    super(message, "VALIDATION_ERROR", 400, details, true);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "User is not authenticated") {
    super(message, "AUTHENTICATION_REQUIRED", 401, null, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Action is forbidden for this user") {
    super(message, "FORBIDDEN_ACCESS", 403, null, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource not found") {
    super(message, "RESOURCE_NOT_FOUND", 404, null, true);
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Resource conflict detected",
    details: Record<string, unknown> | null = null,
  ) {
    super(message, "RESOURCE_CONFLICT", 409, details, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMIT_EXCEEDED", 429, null, true);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "An unexpected error occurred",
    details: Record<string, unknown> | null = null,
  ) {
    super(message, "INTERNAL_SERVER_ERROR", 500, details, false);
  }
}

/**
 * Normalizes any error object into a predictable client-facing AppError payload.
 */
export function normalize_error(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // If it's a native Node or database error, mask details for safety but log internally
    return new InternalServerError(error.message, { original_name: error.name });
  }

  return new InternalServerError("An unknown system error occurred");
}

// ─── Safe async wrapper ───────────────────────────────────
// export async function trySafe<T>(fn: () => Promise<T>): Promise<[T, null] | [null, Error]> {
//   try {
//     const result = await fn();
//     return [result, null];
//   } catch (error) {
//     return [null, error instanceof Error ? error : new Error(String(error))];
//   }
// }

export async function tryFn<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
  try {
    const data = await promise;
    return [undefined, data] as [undefined, T];
  } catch (error) {
    const err = assertIsError(error);
    return [err];
  }
}

// ─── Assert helpers ───────────────────────────────────────
export function assertIsError(value: unknown): Error {
  if (value instanceof Error) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new Error(`This value was thrown as is, not through an Error: ${stringified}`);
  return error;
}

export function assertFound<T>(value: T | null | undefined, resource: string): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource);
  }
  return value;
}

export function assertAuth(condition: boolean, message?: string): void {
  if (!condition) {
    throw new ForbiddenError(message);
  }
}
