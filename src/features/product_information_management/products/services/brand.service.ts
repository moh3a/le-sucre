import "server-only";

import type { z } from "zod";

import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { slugify_name } from "@/features/product_information_management/categories/repositories/category-tree.engine";

import type { create_brand_dto, update_brand_dto } from "../models/brand.dto";
import { BrandRepository } from "../repositories/brand.repository";

export class BrandService {
  constructor(private readonly repo = new BrandRepository()) {}

  async create(input: z.infer<typeof create_brand_dto>) {
    const slug = input.slug ?? slugify_name(input.name);
    if (await this.repo.find_by_slug(slug)) {
      throw new ConflictError("Ce slug de marque existe déjà");
    }
    const id = generate_id();
    await this.repo.create({
      id,
      name: input.name,
      slug,
      description: input.description ?? null,
      website_url: input.website_url ?? null,
      logo_url: input.logo_url ?? null,
      is_active: input.is_active,
    });
    return this.repo.find_by_id(id);
  }

  async update(input: z.infer<typeof update_brand_dto>) {
    const current = await this.repo.find_by_id(input.id);
    if (!current) throw new NotFoundError("Marque introuvable");
    if (input.slug && input.slug !== current.slug && (await this.repo.find_by_slug(input.slug))) {
      throw new ConflictError("Ce slug de marque existe déjà");
    }
    await this.repo.update(input.id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.website_url !== undefined && { website_url: input.website_url }),
      ...(input.logo_url !== undefined && { logo_url: input.logo_url }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    });
    return this.repo.find_by_id(input.id);
  }

  async list(params: Parameters<BrandRepository["list"]>[0]) {
    return this.repo.list(params);
  }

  async list_active() {
    return this.repo.list_active();
  }

  async get_by_id(id: string) {
    const brand = await this.repo.find_by_id(id);
    if (!brand) throw new NotFoundError("Marque introuvable");
    return brand;
  }

  async remove(id: string) {
    const brand = await this.repo.find_by_id(id);
    if (!brand) throw new NotFoundError("Marque introuvable");
    await this.repo.delete(id);
    return { ok: true };
  }
}

export const brand_service = new BrandService();
