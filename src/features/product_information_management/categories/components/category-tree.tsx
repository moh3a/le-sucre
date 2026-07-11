"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "../types";

function Node({ node, depth }: { node: CategoryTreeNode; depth: number }) {
  return (
    <div>
      <span
        className={cn("block rounded-md px-2 py-1 text-sm", !node.is_active && "opacity-50")}
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        {node.name}
      </span>
      {node.children.map((child) => (
        <Node key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CategoryTree() {
  const t = useTranslations("categories");
  const query = trpc.categories.tree.useQuery();
  const { data } = query;
  if (!data?.length) return <p className="text-muted-foreground text-sm">{t("empty")}</p>;
  return (
    <QueryGuard query={query}>
      <ul className="space-y-1 text-sm">
        {data.map((n) => (
          <Node key={n.id} node={n} depth={0} />
        ))}
      </ul>
    </QueryGuard>
  );
}
