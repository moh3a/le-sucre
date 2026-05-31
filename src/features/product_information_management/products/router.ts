import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

import {
  create_product_dto,
  update_product_dto,
  list_products_dto,
  upsert_translation_dto,
  product_media_dto,
  delete_media_dto,
  upload_intent_dto,
} from "./models/product.dto";
import { create_brand_dto, update_brand_dto, list_brands_dto } from "./models/brand.dto";
import { product_service } from "./services/product.service";
import { brand_service } from "./services/brand.service";
import { product_admin_service } from "./services/product-admin.service";
import { admin_list_products_dto, bulk_product_action_dto } from "./models/product-admin.dto";

export const product_router = create_trpc_router({
  list: permission_procedure(PERMISSIONS.products_read)
    .input(list_products_dto)
    .query(({ input }) => product_service.list(input)),

  byId: permission_procedure(PERMISSIONS.products_read)
    .input(update_product_dto.pick({ id: true }))
    .query(({ input }) => product_service.get_by_id(input.id)),

  create: permission_procedure(PERMISSIONS.products_write)
    .input(create_product_dto)
    .mutation(({ input }) => product_service.create(input)),

  update: permission_procedure(PERMISSIONS.products_write)
    .input(update_product_dto)
    .mutation(({ input }) => product_service.update(input)),

  delete: permission_procedure(PERMISSIONS.products_write)
    .input(update_product_dto.pick({ id: true }))
    .mutation(({ input }) => product_service.remove(input.id)),

  upsertTranslation: permission_procedure(PERMISSIONS.products_write)
    .input(upsert_translation_dto)
    .mutation(({ input }) => product_service.upsert_translation(input)),

  addMedia: permission_procedure(PERMISSIONS.products_write)
    .input(product_media_dto)
    .mutation(({ input }) => product_service.add_media(input)),

  removeMedia: permission_procedure(PERMISSIONS.products_write)
    .input(delete_media_dto)
    .mutation(({ input }) => product_service.remove_media(input.media_id, input.product_id)),

  mediaUploadIntent: permission_procedure(PERMISSIONS.products_write)
    .input(upload_intent_dto)
    .mutation(({ input }) =>
      product_service.create_upload_intent(input.product_id, input.filename, input.mime_type),
    ),

  brandsList: permission_procedure(PERMISSIONS.products_read)
    .input(list_brands_dto)
    .query(({ input }) => brand_service.list(input)),

  brandsActive: permission_procedure(PERMISSIONS.products_read).query(() =>
    brand_service.list_active(),
  ),

  brandCreate: permission_procedure(PERMISSIONS.products_write)
    .input(create_brand_dto)
    .mutation(({ input }) => brand_service.create(input)),

  brandUpdate: permission_procedure(PERMISSIONS.products_write)
    .input(update_brand_dto)
    .mutation(({ input }) => brand_service.update(input)),

  adminStats: permission_procedure(PERMISSIONS.products_read).query(() =>
    product_admin_service.stats(),
  ),
  adminList: permission_procedure(PERMISSIONS.products_read)
    .input(admin_list_products_dto)
    .query(({ input }) => product_admin_service.list(input)),
  bulkAction: permission_procedure(PERMISSIONS.products_write)
    .input(bulk_product_action_dto)
    .mutation(({ input }) => product_admin_service.bulk(input)),
});
