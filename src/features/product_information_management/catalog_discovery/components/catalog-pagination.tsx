"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function CatalogPagination({ page, totalPages, onChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const range = 2;

  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="size-9 rounded-lg"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(1)}
            className="size-9 rounded-lg text-sm"
          >
            1
          </Button>
          {pages[0] > 2 && (
            <span className="text-muted-foreground/40 flex size-9 items-center justify-center text-xs">
              ...
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          onClick={() => onChange(p)}
          className={cn("size-9 rounded-lg text-sm", p === page && "shadow-sm")}
        >
          {p}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-muted-foreground/40 flex size-9 items-center justify-center text-xs">
              ...
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChange(totalPages)}
            className="size-9 rounded-lg text-sm"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="size-9 rounded-lg"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
