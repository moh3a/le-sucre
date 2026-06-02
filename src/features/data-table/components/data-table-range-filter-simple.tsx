"use client";

import * as React from "react";
import { XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface RangeFilterProps {
  title: string;
  min: number;
  max: number;
  minValue?: number | null;
  maxValue?: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  unit?: string;
}

export function RangeFilter({
  title,
  min,
  max,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
}: RangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {minValue != null || maxValue != null ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onMinChange(null);
                onMaxChange(null);
              }}
            >
              <XCircle className="size-4" />
            </div>
          ) : (
            <div className="size-4" />
          )}
          <span className="ml-2">{title}</span>
          {minValue != null || maxValue != null ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <span className="ml-1">
                {minValue != null ? minValue : "-"} - {maxValue != null ? maxValue : "-"}
                {unit ? ` ${unit}` : ""}
              </span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Label htmlFor={`${title}-min`} className="sr-only">
                Min
              </Label>
              <Input
                id={`${title}-min`}
                type="number"
                placeholder={min.toString()}
                min={min}
                max={max}
                value={minValue ?? ""}
                onChange={(e) =>
                  onMinChange(e.target.value ? Number(e.target.value) : null)
                }
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
            <div className="relative flex-1">
              <Label htmlFor={`${title}-max`} className="sr-only">
                Max
              </Label>
              <Input
                id={`${title}-max`}
                type="number"
                placeholder={max.toString()}
                min={min}
                max={max}
                value={maxValue ?? ""}
                onChange={(e) =>
                  onMaxChange(e.target.value ? Number(e.target.value) : null)
                }
                className={unit ? "pr-8" : ""}
              />
              {unit && (
                <span className="bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
          <Slider
            min={min}
            max={max}
            step={1}
            value={[minValue ?? min, maxValue ?? max]}
            onValueChange={([newMin, newMax]) => {
              onMinChange(newMin);
              onMaxChange(newMax);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
