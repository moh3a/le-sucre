"use client";

import { parseAsString, useQueryState } from "nuqs";
import { format, subDays } from "date-fns";

const DEFAULT_FROM = format(subDays(new Date(), 30), "yyyy-MM-dd");
const DEFAULT_TO = format(new Date(), "yyyy-MM-dd");

export function useAnalyticsDateRange() {
  const [from, setFrom] = useQueryState("aFrom", parseAsString.withDefault(DEFAULT_FROM));
  const [to, setTo] = useQueryState("aTo", parseAsString.withDefault(DEFAULT_TO));

  return { from, to, setFrom, setTo };
}
