/* eslint-disable @next/next/no-img-element */
"use client";

import { TrendingUp, Package, Building2, Tags } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { useSearchSuggestions, useTrendingSearches } from "../hooks/use-search-suggestions";
import type { SearchSuggestion, TrendingSearchTerm } from "../types";

interface SearchSuggestionsProps {
  locale: string;
  query: string;
  isFocused: boolean;
  onSelectSuggestion: (text: string) => void;
  onClose: () => void;
}

const SUGGESTION_ICONS = {
  product: Package,
  brand: Building2,
  category: Tags,
} as const;

export function SearchSuggestions({
  locale,
  query,
  isFocused,
  onSelectSuggestion,
  onClose,
}: SearchSuggestionsProps) {
  const t = useTranslations("catalog");

  const debouncedQuery = useDebounce(query, 200);
  const { data: suggestionsRes, isLoading: suggestionsLoading } = useSearchSuggestions(
    locale,
    debouncedQuery,
  );
  const { data: trending } = useTrendingSearches(locale);

  const suggestions = suggestionsRes?.items ?? [];
  const showTrending = !query.trim() && isFocused && trending && trending.length > 0;
  const showSuggestions = query.trim().length >= 1 && isFocused && suggestions.length > 0;
  const showLoading = query.trim().length >= 1 && isFocused && suggestionsLoading;

  if (!isFocused) return null;
  if (!showTrending && !showSuggestions && !showLoading) return null;

  return (
    <div className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5">
      {showTrending && <TrendingSection trending={trending} onSelect={onSelectSuggestion} t={t} />}

      {showLoading && (
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="bg-muted size-4 animate-pulse rounded-full" />
          <div className="bg-muted h-3 flex-1 animate-pulse rounded" />
        </div>
      )}

      {showSuggestions && (
        <SuggestionsList suggestions={suggestions} query={query} onSelect={onSelectSuggestion} />
      )}

      {(showTrending || showSuggestions) && (
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted/50 flex w-full items-center gap-2 px-4 py-2.5 text-xs transition-colors"
          onClick={onClose}
        >
          <kbd className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">ESC</kbd>
          <span>{t("close_suggestions")}</span>
        </button>
      )}
    </div>
  );
}

function TrendingSection({
  trending,
  onSelect,
  t,
}: {
  trending: TrendingSearchTerm[];
  onSelect: (text: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs font-medium tracking-wider uppercase">
        <TrendingUp className="size-3" />
        {t("trending_searches")}
      </div>
      <div className="py-1">
        {trending.slice(0, 6).map((term) => (
          <button
            key={term.query}
            type="button"
            className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(term.query);
            }}
          >
            <TrendingUp className="text-muted-foreground/40 size-3.5 shrink-0" />
            <span className="truncate">{term.query}</span>
            <span className="text-muted-foreground/50 ml-auto text-xs">{term.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SuggestionsList({
  suggestions,
  query,
  onSelect,
}: {
  suggestions: SearchSuggestion[];
  query: string;
  onSelect: (text: string) => void;
}) {
  return (
    <div className="py-1">
      {suggestions.map((suggestion, i) => {
        const Icon = SUGGESTION_ICONS[suggestion.type];
        return (
          <button
            key={`${suggestion.type}-${suggestion.slug}-${i}`}
            type="button"
            className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(suggestion.text);
            }}
          >
            <Icon className="text-muted-foreground/40 size-4 shrink-0" />
            <span className="truncate">
              <HighlightMatch text={suggestion.text} query={query} />
            </span>
            {suggestion.image_url && (
              <img
                src={suggestion.image_url}
                alt=""
                className="size-7 shrink-0 rounded-md object-cover"
              />
            )}
            <span className="text-muted-foreground/50 ml-auto text-[10px] uppercase">
              {suggestion.type}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/15 text-foreground rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
