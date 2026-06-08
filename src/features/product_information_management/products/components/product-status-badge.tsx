"use client";

import z from "zod";

import { Badge } from "@/components/ui/badge";
import { product_status_enum } from "../models/product.dto";
import { useTranslations } from "next-intl";

export function ProductStatusBadge({ status }: { status: z.infer<typeof product_status_enum> }) {
  const t = useTranslations("products");

  return (
    <Badge
      variant={status === "published" ? "default" : status === "archived" ? "secondary" : "outline"}
    >
      {t(`status_${status}`)}
    </Badge>
  );
}
