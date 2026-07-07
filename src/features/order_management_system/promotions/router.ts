import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { promotion_service } from "./services/promotion.service";
import { promotion_repository } from "./repositories/promotion.repository";
import { flash_sale_service } from "./services/flash-sale.service";
import { cart_discount_service } from "./services/cart-discount.service";
import {
  create_promotion_dto,
  update_promotion_dto,
  list_promotions_dto,
  create_promo_code_dto,
  create_flash_sale_dto,
  create_bundle_dto,
  validate_promo_code_dto,
} from "./models/promotion.dto";

export const promotion_router = create_trpc_router({
  adminList: permission_procedure(PERMISSIONS.promotions_read)
    .input(list_promotions_dto)
    .query(({ input }) => promotion_service.list(input)),

  promotionStats: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({}).optional())
    .query(() => promotion_repository.stats()),

  byId: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({ id: z.string().min(1).max(255) }))
    .query(({ input }) => promotion_service.get(input.id)),

  create: permission_procedure(PERMISSIONS.promotions_write)
    .input(create_promotion_dto)
    .mutation(({ input }) => promotion_service.create(input)),

  update: permission_procedure(PERMISSIONS.promotions_write)
    .input(update_promotion_dto)
    .mutation(({ input }) => promotion_service.update(input)),

  createPromoCode: permission_procedure(PERMISSIONS.promotions_write)
    .input(create_promo_code_dto)
    .mutation(({ input }) => promotion_service.create_promo_code(input)),

  createFlashSale: permission_procedure(PERMISSIONS.promotions_write)
    .input(create_flash_sale_dto)
    .mutation(({ input }) => promotion_service.create_flash_sale(input)),

  createBundle: permission_procedure(PERMISSIONS.promotions_write)
    .input(create_bundle_dto)
    .mutation(({ input }) => promotion_service.create_bundle(input)),

  validateCode: public_procedure.input(validate_promo_code_dto).mutation(({ input, ctx }) =>
    cart_discount_service.apply({
      lines: input.lines,
      user_id: ctx.session?.user?.id ?? null,
      promo_code: input.code,
      shipping_cost: input.shipping_cost,
    }),
  ),

  activeFlashSales: public_procedure.query(() => flash_sale_service.list_storefront()),

  storefrontPromotions: public_procedure.query(() => promotion_service.get_storefront_data()),
});
