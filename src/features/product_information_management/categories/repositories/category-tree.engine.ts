import "server-only";
import { eq, inArray, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories } from "../schema";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import type { CategoryRecord, CategoryTreeNode } from "../types";

const MAX_DEPTH = 50;

export function slugify_name(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function build_path(parent_path: string | null, id: string): string {
  return parent_path ? `${parent_path}${id}/` : `/${id}/`;
}

export function parse_ancestor_ids(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export class CategoryTreeEngine {
  build_tree_from_flat(rows: CategoryRecord[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const row of rows) {
      map.set(row.id, { ...row, children: [] });
    }
    for (const node of map.values()) {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sort_nodes = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      nodes.forEach((n) => sort_nodes(n.children));
    };
    sort_nodes(roots);
    return roots;
  }

  async assert_parent_valid(parent_id: string | null, self_id?: string) {
    if (!parent_id) return { parent_path: null as string | null, depth: 0 };
    const [parent] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, parent_id))
      .limit(1);
    if (!parent) throw new NotFoundError("Catégorie parente introuvable");
    if (self_id && parent.path.includes(`/${self_id}/`)) {
      throw new ConflictError("Déplacement invalide : cycle détecté");
    }
    if (parent.depth >= MAX_DEPTH - 1) {
      throw new ConflictError(`Profondeur maximale (${MAX_DEPTH}) atteinte`);
    }
    return { parent_path: parent.path, depth: parent.depth + 1 };
  }

  /** Descendants via materialized path prefix (indexed). */
  async find_descendants(category_id: string, include_self = false) {
    const [node] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, category_id))
      .limit(1);
    if (!node) throw new NotFoundError("Catégorie introuvable");

    const rows = await db
      .select()
      .from(categories)
      .where(like(categories.path, `${node.path}%`))
      .orderBy(categories.depth, categories.sort_order);

    return include_self ? rows : rows.filter((r) => r.id !== category_id);
  }

  /** Ancestors ordered root → parent. */
  async find_ancestors(category_id: string): Promise<CategoryRecord[]> {
    const [node] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, category_id))
      .limit(1);
    if (!node) throw new NotFoundError("Catégorie introuvable");

    const ids = parse_ancestor_ids(node.path).filter((id) => id !== category_id);
    if (!ids.length) return [];

    return db
      .select()
      .from(categories)
      .where(inArray(categories.id, ids))
      .then((rows) => ids.map((id) => rows.find((r) => r.id === id)!).filter(Boolean));
  }

  /** Optimized product filter helper: all category IDs in subtree. */
  async resolve_filter_category_ids(category_id: string, include_descendants: boolean) {
    if (!include_descendants) return [category_id];
    const descendants = await this.find_descendants(category_id, true);
    return descendants.map((d) => d.id);
  }

  /** Repath subtree after move/reparent. */
  async repath_subtree(old_path: string, new_path: string, depth_delta: number) {
    await db
      .update(categories)
      .set({
        path: sql`CONCAT(${new_path}, SUBSTRING(${categories.path}, ${old_path.length + 1}))`,
        depth: sql`${categories.depth} + ${depth_delta}`,
      })
      .where(like(categories.path, `${old_path}%`));
  }
}
