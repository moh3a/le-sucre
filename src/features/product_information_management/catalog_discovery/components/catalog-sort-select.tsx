"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogSort } from "../types";

interface CatalogSortSelectProps {
  value: CatalogSort;
  onChange: (value: CatalogSort) => void;
}

export function CatalogSortSelect({ value, onChange }: CatalogSortSelectProps) {
  const t = useTranslations("catalog");
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as CatalogSort)}>
        <SelectTrigger className="w-[200px] rounded-lg text-sm">
          <ArrowUpDown className="text-muted-foreground/60 mr-2 size-4" />
          <SelectValue placeholder={t("sort_placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">{t("sort_relevance")}</SelectItem>
          <SelectItem value="price_asc">{t("sort_price_asc")}</SelectItem>
          <SelectItem value="price_desc">{t("sort_price_desc")}</SelectItem>
          <SelectItem value="newest">{t("sort_newest")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
