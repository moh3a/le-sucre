export type CategoryRecord = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  path: string;
  depth: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryTreeNode = CategoryRecord & {
  children: CategoryTreeNode[];
};

export type CategoryBreadcrumb = Pick<CategoryRecord, "id" | "name" | "slug" | "path">;
