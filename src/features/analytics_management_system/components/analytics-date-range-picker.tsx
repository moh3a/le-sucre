"use client";

import * as React from "react";
import { CalendarIcon, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/format";

interface AnalyticsDateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string | null) => void;
  onToChange: (value: string | null) => void;
}

export function AnalyticsDateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: AnalyticsDateRangePickerProps) {
  const t = useTranslations("analytics");
  const [open, setOpen] = React.useState(false);

  const selectedRange = React.useMemo(() => {
    if (!from && !to) return undefined;
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  }, [from, to]);

  const formatDateRange = () => {
    if (!from && !to) return t("date_range_all");
    if (from && to) return `${formatDate(new Date(from))} - ${formatDate(new Date(to))}`;
    if (from) return `${t("date_range_from")} ${formatDate(new Date(from))}`;
    if (to) return `${t("date_range_to")} ${formatDate(new Date(to))}`;
    return t("date_range_all");
  };

  const hasFilter = Boolean(from || to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {hasFilter ? (
            <div
              role="button"
              aria-label={t("date_range_clear")}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onFromChange(null);
                onToChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            <CalendarIcon className="size-4" />
          )}
          <span className="ml-2">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          autoFocus
          captionLayout="dropdown"
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            onFromChange(range?.from ? format(range.from, "yyyy-MM-dd") : null);
            onToChange(range?.to ? format(range.to, "yyyy-MM-dd") : null);
            if (range?.from && range?.to) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
