import "server-only";

import z from "zod";
import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/features/product_information_management/products/schema";
import { category_repository } from "@/features/product_information_management/categories/repositories/category.repository";
import { category_cache_service } from "@/features/product_information_management/categories/services/category-cache.service";
import {
  CategoryTreeEngine,
  build_path,
  slugify_name,
} from "@/features/product_information_management/categories/repositories/category-tree.engine";
import type { CategoryTreeNode } from "@/features/product_information_management/categories/types";
import { create_category_dto, update_category_dto } from "../models/category.dto";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { CATEGORY_ERROR } from "../constants/error-codes";
import { generate_id } from "@/lib/utils";
import { invalidate_catalog_cache } from "@/features/product_information_management/catalog_discovery/helpers/invalidate-catalog-cache.helper";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { tryFn, AppError } from "@/lib/error_handling";

function db_error_reason(err: Error): { fr: string; en: string; ar: string } {
  const msg = err.message.toLowerCase();

  if (msg.includes("foreign key constraint") || msg.includes("a parent row")) {
    return {
      fr: "Cette catégorie est référencée par d'autres éléments (produits, campagnes) et ne peut pas être modifiée tant que ces références existent",
      en: "This category is referenced by other items (products, campaigns) and cannot be modified while those references exist",
      ar: "يشير هذا التصنيف إلى عناصر أخرى (منتجات، حملات) ولا يمكن تعديلها طالما توجد هذه المراجع",
    };
  }
  if (msg.includes("duplicate entry") || msg.includes("unique")) {
    return {
      fr: "Une contrainte d'unicité est violée. Un élément avec la même valeur existe déjà",
      en: "A unique constraint is violated. An item with the same value already exists",
      ar: "يتم انتهاك قيد الفريد. يوجد عنصر بنفس القيمة بالفعل",
    };
  }
  if (msg.includes("cannot be null")) {
    return {
      fr: "Un champ obligatoire n'a pas été fourni",
      en: "A required field was not provided",
      ar: "لم يتم تقديم حق مطلوب",
    };
  }
  if (msg.includes("data too long") || msg.includes("out of range")) {
    return {
      fr: "La valeur fournie dépasse la taille maximale autorisée par le champ",
      en: "The provided value exceeds the maximum size allowed by the field",
      ar: "القيمة المقدمة تتجاوز الحد الأقصى المسموح به للحقل",
    };
  }
  if (msg.includes("connection") || msg.includes("econnrefused") || msg.includes("etimeout")) {
    return {
      fr: "La connexion à la base de données a été perdue. Vérifiez que le serveur est accessible",
      en: "The database connection was lost. Check that the server is accessible",
      ar: "فقد الاتصال بقاعدة البيانات. تحقق من أن الخادم متاح",
    };
  }
  return {
    fr: "Une erreur inattendue est survenue lors de l'opération sur la base de données",
    en: "An unexpected error occurred during the database operation",
    ar: "حدث خطأ غير متوقع أثناء عملية قاعدة البيانات",
  };
}

async function count_products_in_category(category_id: string): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.category_id, category_id));
  return Number(total);
}

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
    const [error, result] = await tryFn(this.repo.list_flat(params));
    if (error) {
      const msg = db_error_reason(error);
      throw new AppError(msg.fr, "CATEGORY_LIST_FAILED", 500, {
        _messages: msg,
      });
    }
    return result;
  }

  async find_by_id(id: string) {
    const [error, result] = await tryFn(this.repo.find_by_id(id));
    if (error) {
      const msg = db_error_reason(error);
      throw new AppError(msg.fr, "CATEGORY_FETCH_FAILED", 500, {
        _messages: msg,
      });
    }
    return result;
  }

  async get_full_tree(active_only = false): Promise<CategoryTreeNode[]> {
    const key = active_only ? "storefront" : "admin";
    const cache_key = key === "storefront" ? "category:storefront:tree" : "category:admin:tree";

    const [cache_err, cached] = await tryFn(this.cache.get<CategoryTreeNode[]>(cache_key));
    if (cache_err) throw_error(CATEGORY_ERROR.CACHE_GET_FAILED);
    if (cached) return cached;

    const [db_err, rows] = await tryFn(this.repo.list_all_for_tree(active_only));
    if (db_err) {
      const msg = db_error_reason(db_err);
      throw new AppError(msg.fr, "CATEGORY_TREE_BUILD_FAILED", 500, {
        _messages: msg,
      });
    }

    const tree = this.tree.build_tree_from_flat(rows as never);

    const [set_err] = await tryFn(this.cache.set(cache_key, tree));
    if (set_err) throw_error(CATEGORY_ERROR.CACHE_SET_FAILED);

    return tree;
  }

  async create(input: z.infer<typeof create_category_dto>) {
    const slug = input.slug ?? slugify_name(input.name);
    if (await this.repo.find_by_slug(slug)) throw_error(CATEGORY_ERROR.SLUG_CONFLICT);

    const { parent_path, depth } = await this.tree.assert_parent_valid(input.parent_id ?? null);
    const id = generate_id();
    const path = build_path(parent_path, id);

    const [insert_err] = await tryFn(
      this.repo.insert({
        id,
        parent_id: input.parent_id ?? null,
        name: input.name,
        slug,
        description: input.description ?? null,
        path,
        depth,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
      }),
    );
    if (insert_err) {
      if (insert_err instanceof AppError) throw insert_err;
      const msg = db_error_reason(insert_err);
      throw new AppError(msg.fr, "CATEGORY_CREATE_FAILED", 500, {
        _messages: msg,
      });
    }

    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    void audit_service.log({
      action: "category.create",
      resource_type: "category_id",
      resource_id: id,
    });

    const [fetch_err, created] = await tryFn(this.repo.find_by_id(id));
    if (fetch_err) {
      const fetch_msg = db_error_reason(fetch_err);
      throw new AppError(fetch_msg.fr, "CATEGORY_FETCH_FAILED", 500, {
        _messages: fetch_msg,
      });
    }
    return created;
  }

  async update(input: z.infer<typeof update_category_dto>) {
    const current = await this.repo.find_by_id(input.id);
    if (!current) throw_error(CATEGORY_ERROR.NOT_FOUND);

    if (input.slug && input.slug !== current.slug && (await this.repo.find_by_slug(input.slug))) {
      throw_error(CATEGORY_ERROR.SLUG_CONFLICT);
    }

    if (input.is_active === false) {
      const product_count = await count_products_in_category(input.id);
      if (product_count > 0) {
        throw_error(CATEGORY_ERROR.HAS_PRODUCTS, { product_count });
      }
    }

    const [update_err] = await tryFn(
      this.repo.update(input.id, {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug != null && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
      }),
    );
    if (update_err) {
      if (update_err instanceof AppError) throw update_err;
      const msg = db_error_reason(update_err);
      throw new AppError(msg.fr, "CATEGORY_UPDATE_FAILED", 500, {
        _messages: msg,
      });
    }

    await this.cache.invalidate_category(input.id);
    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    void audit_service.log({
      action: "category.update",
      resource_type: "category_id",
      resource_id: input.id,
    });

    const [fetch_err, updated] = await tryFn(this.repo.find_by_id(input.id));
    if (fetch_err) {
      const fetch_msg = db_error_reason(fetch_err);
      throw new AppError(fetch_msg.fr, "CATEGORY_FETCH_FAILED", 500, {
        _messages: fetch_msg,
      });
    }
    return updated;
  }

  async move(id: string, new_parent_id: string | null) {
    const node = await this.repo.find_by_id(id);
    if (!node) throw_error(CATEGORY_ERROR.NOT_FOUND);

    const { parent_path, depth } = await this.tree.assert_parent_valid(new_parent_id, id);
    const new_path = build_path(parent_path, id);
    const depth_delta = depth - node.depth;

    const [move_err] = await tryFn(
      Promise.all([
        this.repo.update(id, { parent_id: new_parent_id, path: new_path, depth }),
        this.tree.repath_subtree(node.path, new_path, depth_delta),
      ]),
    );
    if (move_err) {
      if (move_err instanceof AppError) throw move_err;
      const msg = db_error_reason(move_err);
      throw new AppError(msg.fr, "CATEGORY_MOVE_FAILED", 500, {
        _messages: msg,
      });
    }

    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    const [fetch_err, moved] = await tryFn(this.repo.find_by_id(id));
    if (fetch_err) {
      const fetch_msg = db_error_reason(fetch_err);
      throw new AppError(fetch_msg.fr, "CATEGORY_FETCH_FAILED", 500, {
        _messages: fetch_msg,
      });
    }
    return moved;
  }

  async remove(id: string) {
    const node = await this.repo.find_by_id(id);
    if (!node) throw_error(CATEGORY_ERROR.NOT_FOUND);

    const [{ total: child_count }] = await this.repo.count_direct_children(id);
    if (Number(child_count) > 0) throw_error(CATEGORY_ERROR.HAS_CHILDREN);

    const product_count = await count_products_in_category(id);
    if (product_count > 0) {
      throw_error(CATEGORY_ERROR.HAS_PRODUCTS_DELETE, { product_count });
    }

    const [delete_err] = await tryFn(this.repo.delete(id));
    if (delete_err) {
      if (delete_err instanceof AppError) throw delete_err;
      const msg = db_error_reason(delete_err);
      throw new AppError(msg.fr, "CATEGORY_DELETE_FAILED", 500, {
        _messages: msg,
      });
    }

    await this.cache.invalidate_all();
    void invalidate_catalog_cache();

    void audit_service.log({
      action: "category.remove",
      resource_type: "category_id",
      resource_id: id,
    });

    return { deleted: true };
  }

  get_descendants = (id: string, include_self?: boolean) =>
    this.tree.find_descendants(id, include_self);
  get_ancestors = (id: string) => this.tree.find_ancestors(id);
  resolve_filter_ids = (id: string, include_descendants: boolean) =>
    this.tree.resolve_filter_category_ids(id, include_descendants);

  async get_stats() {
    const [error, result] = await tryFn(this.repo.get_stats());
    if (error) {
      const msg = db_error_reason(error);
      throw new AppError(msg.fr, "CATEGORY_STATS_FAILED", 500, {
        _messages: msg,
      });
    }
    return result;
  }
}

export const category_service = new CategoryService();
