"use client";

import { trpc } from "@/components/providers/app-providers";
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
  const { data } = trpc.categories.tree.useQuery();
  if (!data?.length) return <p className="text-muted-foreground text-sm">…</p>;
  return (
    <ul className="space-y-1 text-sm">
      {data.map((n) => (
        <Node key={n.id} node={n} depth={0} />
      ))}
    </ul>
  );
}
