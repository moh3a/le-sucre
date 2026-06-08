import { format } from "date-fns";

export function build_order_number() {
  const ymd = format(new Date(), "yyyy-MM-dd");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LS-${ymd}-${suffix}`;
}
