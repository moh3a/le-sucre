"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestions } from "./search-suggestions";

interface CatalogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  locale?: string;
}

export function CatalogSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  locale = "fr",
}: CatalogSearchBarProps) {
  const t = useTranslations("catalog");
  const resolvedPlaceholder = placeholder ?? t("search_placeholder");
  const [prevValue, setPrevValue] = React.useState(value);
  const [internalValue, setInternalValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsFocused(false);
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === "Enter") {
      setIsFocused(false);
      (e.target as HTMLInputElement).blur();
      onSubmit?.(internalValue);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setInternalValue(text);
    onChange(text);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="text-muted-foreground/60 pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search className="size-5" />
      </div>
      <Input
        type="text"
        className="bg-background w-full rounded-lg py-5 pr-10 pl-10 text-sm md:text-base"
        placeholder={resolvedPlaceholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
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

      <SearchSuggestions
        locale={locale}
        query={internalValue}
        isFocused={isFocused}
        onSelectSuggestion={handleSelectSuggestion}
        onClose={() => setIsFocused(false)}
      />
    </div>
  );
}
