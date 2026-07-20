"use client";

import type { TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { TRPCClientError } from "@trpc/client";

export interface NetworkAwareLinkOptions {
  /** Timeout per request in ms */
  timeout_ms?: number;
  /** Called on request timeout */
  on_timeout?: () => void;
  /** Called when backend is unavailable (503/502/504) */
  on_backend_unavailable?: () => void;
  /** Called when a request fails */
  on_request_failed?: () => void;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * A tRPC link that detects timeouts and backend unavailability,
 * and forwards those signals to the NetworkProvider.
 */
export function create_network_link(options: NetworkAwareLinkOptions = {}): TRPCLink<AnyRouter> {
  const {
    timeout_ms = DEFAULT_TIMEOUT_MS,
    on_timeout,
    on_backend_unavailable,
    on_request_failed,
  } = options;

  return () => {
    return ({ op, next }) => {
      return observable((observer) => {
        let timeout_id: ReturnType<typeof setTimeout> | null = null;
        let settled = false;

        function cleanup() {
          if (timeout_id) {
            clearTimeout(timeout_id);
            timeout_id = null;
          }
        }

        timeout_id = setTimeout(() => {
          if (!settled) {
            settled = true;
            cleanup();
            on_timeout?.();
            observer.error(TRPCClientError.from(new Error("REQUEST_TIMEOUT")));
          }
        }, timeout_ms);

        const subscription = next(op).subscribe({
          next(result) {
            if (!settled) {
              settled = true;
              cleanup();
              observer.next(result);
            }
          },
          error(err) {
            if (!settled) {
              settled = true;
              cleanup();

              const status = extract_http_status(err);
              if (status === 502 || status === 503 || status === 504) {
                on_backend_unavailable?.();
              }

              on_request_failed?.();
              observer.error(err);
            }
          },
          complete() {
            if (!settled) {
              settled = true;
              cleanup();
              observer.complete();
            }
          },
        });

        return () => {
          settled = true;
          cleanup();
          subscription.unsubscribe();
        };
      });
    };
  };
}

function extract_http_status(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const err = error as Record<string, unknown>;
  const data = err.data;

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.httpStatus === "number") return d.httpStatus;
  }

  if (typeof err.httpStatus === "number") return err.httpStatus;

  return null;
}
