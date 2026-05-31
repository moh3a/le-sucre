"use client";

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
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as CatalogSort)}>
        <SelectTrigger className="border-secondary/30 text-secondary font-moya w-[200px] rounded-xl bg-[#fff3e3]/20 text-sm focus:ring-[#700145]">
          <ArrowUpDown className="text-secondary/60 mr-2 size-4" />
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent className="border-secondary/20 bg-white">
          <SelectItem
            value="relevance"
            className="text-secondary font-moya focus:text-secondary focus:bg-[#fff3e3]/50"
          >
            Pertinence
          </SelectItem>
          <SelectItem
            value="price_asc"
            className="text-secondary font-moya focus:text-secondary focus:bg-[#fff3e3]/50"
          >
            Prix : croissant
          </SelectItem>
          <SelectItem
            value="price_desc"
            className="text-secondary font-moya focus:text-secondary focus:bg-[#fff3e3]/50"
          >
            Prix : décroissant
          </SelectItem>
          <SelectItem
            value="newest"
            className="text-secondary font-moya focus:text-secondary focus:bg-[#fff3e3]/50"
          >
            Nouveautés
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
