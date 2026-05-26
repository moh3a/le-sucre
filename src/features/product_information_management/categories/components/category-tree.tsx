"use client";
import { trpc } from "@/components/providers/app-providers";
import Link from "next/link";
import type { CategoryTreeNode } from "../types";

function Node({ node, depth }: { node: CategoryTreeNode; depth: number }) {
  return (
    <li>
      <Link href={`/console/categories/${node.id}/edit`} style={{ paddingLeft: depth * 12 }}>
        {node.name}
      </Link>
      {node.children.map((child) => (
        <Node key={child.id} node={child} depth={depth + 1} />
      ))}
    </li>
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
