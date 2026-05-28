import "server-only";

import z from "zod";

import { category_repository } from "@/features/product_information_management/categories/repositories/category.repository";
import { category_cache_service } from "@/features/product_information_management/categories/services/category-cache.service";
import {
  CategoryTreeEngine,
  build_path,
  slugify_name,
} from "@/features/product_information_management/categories/repositories/category-tree.engine";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import { create_category_dto, update_category_dto } from "../models/category.dto";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { invalidate_catalog_cache } from "@/features/catalog_discovery/helpers/invalidate-catalog-cache.helper";

export class CategoryService {
  constructor(
    private readonly repo = category_repository,
    private readonly tree = new CategoryTreeEngine(),
    private readonly cache = category_cache_service,
  ) {}

  async list_flat(params: {
    parent_id?: string | null;
    is_active?: boolean;
    search?: string;
    page: number;
    limit: number;
  }) {
    return await this.repo.list_flat(params);
  }

  async find_by_id(id: string) {
    return await this.repo.find_by_id(id);
  }

  async get_full_tree(active_only = false): Promise<CategoryTreeNode[]> {
    const key = active_only ? "storefront" : "admin";
    const cache_key = key === "storefront" ? "category:storefront:tree" : "category:admin:tree";
    const cached = await this.cache.get<CategoryTreeNode[]>(cache_key);
    if (cached) return cached;

    const rows = await this.repo.list_all_for_tree(active_only);
    const tree = this.tree.build_tree_from_flat(rows as never);
    await this.cache.set(cache_key, tree);
    return tree;
  }

  async create(input: z.infer<typeof create_category_dto>) {
    const slug = input.slug ?? slugify_name(input.name);
    if (await this.repo.find_by_slug(slug)) throw new ConflictError("Ce slug existe déjà");

    const { parent_path, depth } = await this.tree.assert_parent_valid(input.parent_id ?? null);
    const id = generate_id();
    const path = build_path(parent_path, id);

    await this.repo.insert({
      id,
      parent_id: input.parent_id ?? null,
      name: input.name,
      slug,
      description: input.description ?? null,
      path,
      depth,
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    });

    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    return this.repo.find_by_id(id);
  }

  async update(input: z.infer<typeof update_category_dto>) {
    const current = await this.repo.find_by_id(input.id);
    if (!current) throw new NotFoundError("Catégorie introuvable");

    if (input.slug && input.slug !== current.slug && (await this.repo.find_by_slug(input.slug))) {
      throw new ConflictError("Ce slug existe déjà");
    }

    await this.repo.update(input.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    });

    await this.cache.invalidate_category(input.id);
    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    return this.repo.find_by_id(input.id);
  }

  async move(id: string, new_parent_id: string | null) {
    const node = await this.repo.find_by_id(id);
    if (!node) throw new NotFoundError("Catégorie introuvable");

    const { parent_path, depth } = await this.tree.assert_parent_valid(new_parent_id, id);
    const new_path = build_path(parent_path, id);
    const depth_delta = depth - node.depth;

    await this.repo.update(id, { parent_id: new_parent_id, path: new_path, depth });
    await this.tree.repath_subtree(node.path, new_path, depth_delta);

    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    return this.repo.find_by_id(id);
  }

  async remove(id: string) {
    const node = await this.repo.find_by_id(id);
    if (!node) throw new NotFoundError("Catégorie introuvable");

    const [{ total }] = await this.repo.count_direct_children(id);
    if (Number(total) > 0)
      throw new ConflictError("Supprimez ou déplacez les sous-catégories d'abord");

    await this.repo.delete(id);
    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    return { ok: true };
  }

  get_descendants = (id: string, include_self?: boolean) =>
    this.tree.find_descendants(id, include_self);
  get_ancestors = (id: string) => this.tree.find_ancestors(id);
  resolve_filter_ids = (id: string, include_descendants: boolean) =>
    this.tree.resolve_filter_category_ids(id, include_descendants);
}

export const category_service = new CategoryService();
