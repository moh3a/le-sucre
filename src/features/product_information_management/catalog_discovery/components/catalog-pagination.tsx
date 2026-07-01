"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function CatalogPagination({ page, totalPages, onChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const range = 2; // Show 2 pages before and after current page

  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(1)}
        disabled={page === 1}
        className="border-secondary/40 text-secondary hover:bg-secondary/10 size-9"
      >
        <span className="sr-only">Première page</span>
        <ChevronLeft className="-mr-1 size-4" />
        <ChevronLeft className="-ml-1 size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="border-secondary/40 text-secondary hover:bg-secondary/10 size-9"
      >
        <span className="sr-only">Page précédente</span>
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          onClick={() => onChange(p)}
          className={`size-9 ${
            p === page
              ? "bg-crimson-violet text-white hover:bg-crimson-violet/90"
              : "border-secondary/40 text-secondary hover:bg-secondary/10"
          }`}
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="border-secondary/40 text-secondary hover:bg-secondary/10 size-9"
      >
        <span className="sr-only">Page suivante</span>
        <ChevronRight className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        className="border-secondary/40 text-secondary hover:bg-secondary/10 size-9"
      >
        <span className="sr-only">Dernière page</span>
        <ChevronRight className="-mr-1 size-4" />
        <ChevronRight className="-ml-1 size-4" />
      </Button>
    </div>
  );
}
