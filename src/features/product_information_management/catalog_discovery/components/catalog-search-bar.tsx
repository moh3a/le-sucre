"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CatalogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CatalogSearchBar({ value, onChange, placeholder }: CatalogSearchBarProps) {
  const t = useTranslations("catalog");
  const resolvedPlaceholder = placeholder ?? t("search_placeholder");
  const [prevValue, setPrevValue] = React.useState(value);
  const [internalValue, setInternalValue] = React.useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setInternalValue(value);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(internalValue);
    }, 450);

    return () => clearTimeout(timer);
  }, [internalValue, onChange]);

  return (
    <div className="relative w-full max-w-lg">
      <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search className="size-5" />
      </div>
      <Input
        type="text"
        className="bg-background w-full rounded-lg py-5 pr-10 pl-10 text-sm md:text-base"
        placeholder={resolvedPlaceholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
      />
      {internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setInternalValue("");
            onChange("");
          }}
          className="text-muted-foreground/60 hover:text-foreground absolute inset-y-0 right-1.5 h-full hover:bg-transparent"
        >
          <X className="size-4" />
          <span className="sr-only">{t("clear_search")}</span>
        </Button>
      )}
    </div>
  );
}
