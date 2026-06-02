import { json_ok, json_error } from "@/lib/http";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { report_service } from "@/features/product_reviews_management/services/report.service";
import { z } from "zod";

const report_review_dto = z.object({
  reason: z.enum(["spam", "abuse", "off_topic", "fake", "other"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ review_id: string }> },
) {
  try {
    const identity = await get_storefront_identity(req.headers);
    if (!identity.user_id) {
      return json_error(new Error("Unauthorized"));
    }

    const body = await req.json();
    const input = report_review_dto.parse(body);

    const { review_id } = await params;
    const result = await report_service.report(identity.user_id, {
      review_id,
      reason: input.reason,
    });

    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}