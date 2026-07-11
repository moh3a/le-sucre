import z from "zod";
// import { zfd } from "zod-form-data";

import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
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
import { product_service } from "./services/product.service";
import { product_admin_service } from "./services/product-admin.service";
import { admin_list_products_dto, bulk_product_action_dto } from "./models/product-admin.dto";
import { product_media_service } from "./services/product_media.service";
import { TRPCError } from "@trpc/server";

export const product_router = create_trpc_router({
  getBySlug: public_procedure
    .input(z.object({ slug: z.string(), locale: z.enum(["fr", "en", "ar"]).default("fr") }))
    .query(({ input }) => product_service.get_storefront_by_slug(input.slug, input.locale)),

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

  duplicate: permission_procedure(PERMISSIONS.products_write)
    .input(update_product_dto.pick({ id: true }))
    .mutation(({ input }) => product_service.duplicate(input.id)),

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

  mediaUpload: permission_procedure(PERMISSIONS.products_write)
    .input(
      z.object({
        // formData: zfd.formData({
        //   product_id: zfd.text(),
        //   file: zfd.file(),
        //   is_primary: zfd.text(),
        //   alt: zfd.text(),
        //   sort_order: zfd.numeric().optional(),
        // }),
          product_id: z.string(),
          file: z.file(),
          is_primary: z.boolean(),
          alt: z.string(),
          sort_order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!(input.file instanceof File)) {
        throw new TRPCError({ message: "Fichier requis", code: "BAD_REQUEST" });
      }
      const saved = await product_media_service.save_local_file(input.product_id, input.file);
      const media = await product_media_service.attach_media({
        product_id: input.product_id,
        url: saved.public_url,
        filename: saved.filename,
        mime_type: saved.mime_type,
        kind: saved.mime_type.startsWith("video/") ? "video" : "image",
        alt: input.alt,
        sort_order: input.sort_order ?? 1,
        is_primary: input.is_primary,
        metadata: {
          storage_key: saved.storage_key,
          size: saved.size,
          provider: "local",
        },
      });
      return { saved, media };
    }),
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
