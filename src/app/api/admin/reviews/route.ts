import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { moderation_service } from "@/features/product_reviews_management/services/moderation.service";
import { z } from "zod";

const list_reviews_dto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

const moderate_review_dto = z.object({
  review_id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const input = list_reviews_dto.parse({
    page: url.searchParams.get("page"),
    limit: url.searchParams.get("limit"),
    status: url.searchParams.get("status"),
  });
  return moderation_service.admin_list(input);
}, PERMISSIONS.reviews_read);

export const POST = admin_route(async ({ req, user }) => {
  const body = await req.json();
  const input = moderate_review_dto.parse(body);
  return moderation_service.moderate(user.id, input);
}, PERMISSIONS.reviews_moderate);