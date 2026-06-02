import { json_ok, json_error } from "@/lib/http";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { helpful_service } from "@/features/product_reviews_management/services/helpful.service";

export async function POST(
  req: Request,
  { params }: { params: { review_id: string } },
) {
  try {
    const identity = await get_storefront_identity(req.headers);
    if (!identity.user_id) {
      return json_error(new Error("Unauthorized"), 401);
    }

    const { review_id } = params;
    const result = await helpful_service.vote(identity.user_id, review_id);
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ review_id: string }> },
) {
  try {
    const identity = await get_storefront_identity(req.headers);
    if (!identity.user_id) {
      return json_error(new Error("Unauthorized"), 401);
    }

    const { review_id } = await params;
    const result = await helpful_service.remove_vote(identity.user_id, review_id);
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}