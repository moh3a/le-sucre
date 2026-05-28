import "server-only";
import { ConflictError } from "@/lib/error_handling";
import { ORDER_STATUS_TRANSITIONS } from "./constants/order-status";

export function assert_order_transition(from: string, to: string) {
  const allowed = ORDER_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ConflictError(`Transition interdite: ${from} → ${to}`);
  }
}
