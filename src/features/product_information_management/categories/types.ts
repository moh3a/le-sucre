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
  image_url: string | null;
  banner_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryTreeNode = CategoryRecord & {
  children: CategoryTreeNode[];
};

export type CategoryBreadcrumb = Pick<CategoryRecord, "id" | "name" | "slug" | "path">;
