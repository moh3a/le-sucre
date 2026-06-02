"use client";

import * as React from "react";
import { CalendarIcon, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/format";

interface DateRangeFilterProps {
  title: string;
  from?: string | null;
  to?: string | null;
  onFromChange: (value: string | null) => void;
  onToChange: (value: string | null) => void;
}

export function DateRangeFilter({
  title,
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const selectedRange = React.useMemo(() => {
    if (!from && !to) return undefined;
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  }, [from, to]);

  const formatDateRange = () => {
    if (!from && !to) return title;
    if (from && to)
      return `${formatDate(new Date(from))} - ${formatDate(new Date(to))}`;
    if (from) return `From ${formatDate(new Date(from))}`;
    if (to) return `To ${formatDate(new Date(to))}`;
    return title;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {from || to ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          autoFocus
          captionLayout="dropdown"
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            onFromChange(range?.from ? range.from.toISOString().split("T")[0] : null);
            onToChange(range?.to ? range.to.toISOString().split("T")[0] : null);
            if (range?.from && range?.to) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
