"use client";

import { useState, useMemo } from "react";
import { Search, X, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "./category-card";
import { DataState } from "@/components/storefront/data-state";
import type { CategoryItem } from "@/components/storefront/types";

interface CategoryGridProps {
  categories: CategoryItem[];
  searchPlaceholder: string;
  resultsCount: string;
  noResults: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function CategoryGrid({
  categories,
  searchPlaceholder,
  resultsCount,
  noResults,
  emptyTitle,
  emptyDescription,
}: CategoryGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.children.some((child) => child.name.toLowerCase().includes(q)),
    );
  }, [categories, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 pl-10"
        />
        {hasQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      {hasQuery && (
        <p className="text-muted-foreground text-sm">
          {resultsCount}
        </p>
      )}

      <DataState
        isEmpty={filtered.length === 0}
        emptyIcon={<LayoutGrid className="text-muted-foreground/40 h-8 w-8" />}
        emptyTitle={hasQuery ? noResults : emptyTitle}
        emptyDescription={hasQuery ? "" : emptyDescription}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <CategoryCard
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image_url: category.image_url,
                children: category.children.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  description: c.description ?? null,
                  image_url: c.image_url,
                  children: [],
                })),
              }}
            />
          ))}
        </div>
      </DataState>
    </div>
  );
}
