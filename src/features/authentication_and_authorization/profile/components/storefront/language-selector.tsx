"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataState } from "@/components/storefront/data-state";

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSelectorProps {
  title?: string;
  description?: string;
  languages?: LanguageOption[];
  selected?: string;
  isLoading?: boolean;
  error?: unknown;
  onChange?: (code: string) => void;
}

export function LanguageSelector({
  title = "Langue",
  description = "Choisissez votre langue préférée.",
  languages = [],
  selected,
  isLoading,
  error,
  onChange,
}: LanguageSelectorProps) {
  return (
    <DataState
      isLoading={isLoading}
      error={error}
      isEmpty={!languages.length}
      loadingState={
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      }
      emptyState={null}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {languages.map((lang) => (
              <label
                key={lang.code}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted has-checked:border-primary"
              >
                <input
                  type="radio"
                  name="language"
                  value={lang.code}
                  checked={selected === lang.code}
                  onChange={() => onChange?.(lang.code)}
                  className="accent-primary size-4"
                />
                <span className="text-sm font-medium">{lang.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </DataState>
  );
}
