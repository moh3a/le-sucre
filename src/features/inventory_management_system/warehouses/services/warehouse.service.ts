import "server-only";

import type { z } from "zod";

import type { create_warehouse_dto, list_warehouses_dto, update_warehouse_dto } from "../models/warehouse.dto";
import { WAREHOUSE_ERROR } from "../constants/error-codes";
import { throw_error } from "../../shared/error-codes";
import { warehouse_repository } from "../repositories/warehouse.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class WarehouseService {
  async create(input: z.infer<typeof create_warehouse_dto>) {
    if (!/^[a-z0-9_-]+$/.test(input.slug)) {
      throw_error(WAREHOUSE_ERROR.INVALID_SLUG, { slug: input.slug });
    }

    const existing = await warehouse_repository.get_by_slug(input.slug);
    if (existing) throw_error(WAREHOUSE_ERROR.SLUG_CONFLICT, { slug: input.slug });

    const warehouse = await warehouse_repository.create({
      name: input.name,
      slug: input.slug,
      location: input.location ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
    });

    void audit_service.log({
      action: "warehouse.create",
      resource_type: "warehouse_id",
      resource_id: warehouse.id,
    });

    return warehouse;
  }

  async update(input: z.infer<typeof update_warehouse_dto>) {
    const existing = await warehouse_repository.get_by_id(input.id);
    if (!existing) throw_error(WAREHOUSE_ERROR.NOT_FOUND, { warehouse_id: input.id });

    if (input.slug && input.slug !== existing.slug) {
      if (!/^[a-z0-9_-]+$/.test(input.slug)) {
        throw_error(WAREHOUSE_ERROR.INVALID_SLUG, { slug: input.slug });
      }
      const slug_taken = await warehouse_repository.get_by_slug(input.slug);
      if (slug_taken) throw_error(WAREHOUSE_ERROR.SLUG_CONFLICT, { slug: input.slug });
    }

    const warehouse = await warehouse_repository.update(input.id, {
      name: input.name,
      slug: input.slug,
      location: input.location,
      phone: input.phone,
      email: input.email,
      is_active: input.is_active,
    });

    void audit_service.log({
      action: "warehouse.update",
      resource_type: "warehouse_id",
      resource_id: input.id,
    });

    return warehouse;
  }

  async get_by_id(id: string) {
    const warehouse = await warehouse_repository.get_by_id(id);
    if (!warehouse) throw_error(WAREHOUSE_ERROR.NOT_FOUND, { warehouse_id: id });
    return warehouse;
  }

  async list(input: z.infer<typeof list_warehouses_dto>) {
    return warehouse_repository.list(input);
  }

  async list_all_active() {
    return warehouse_repository.list_all_active();
  }
}

export const warehouse_service = new WarehouseService();
