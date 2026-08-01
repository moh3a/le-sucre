import "server-only";
import type { admin_tasks } from "../schema";
import { TASK_TYPES_WITH_COMPLETION_EFFECT } from "../constants/task-types";

type TaskRow = typeof admin_tasks.$inferSelect;

export { TASK_TYPES_WITH_COMPLETION_EFFECT };

export async function apply_completion_side_effect(
  task: TaskRow,
  actor_user_id: string,
): Promise<void> {
  const { reference_type, reference_id } = task;
  if (!reference_type || !reference_id) return;

  switch (task.task_type) {
    case "order_assignment":
      return confirm_referenced_order(reference_type, reference_id, actor_user_id);
    case "payment_follow_up":
      return capture_referenced_payment(reference_type, reference_id, actor_user_id);
    case "product_creation":
      return publish_referenced_product(reference_type, reference_id);
    case "campaign_review":
      return activate_referenced_campaign(reference_type, reference_id);
    default:
      return;
  }
}

async function confirm_referenced_order(
  reference_type: string,
  reference_id: string,
  actor_user_id: string,
) {
  if (reference_type !== "order") return;
  const { order_repository } = await import(
    "@/features/order_management_system/orders/repositories/order.repository"
  );
  const { order_service } = await import(
    "@/features/order_management_system/orders/services/order.service"
  );
  const order = await order_repository.find_by_id(reference_id);
  if (!order || order.status !== "pending_payment") return;
  await order_service.transition_status({
    order_id: reference_id,
    status: "confirmed",
    actor_user_id,
  });
}

async function capture_referenced_payment(
  reference_type: string,
  reference_id: string,
  actor_user_id: string,
) {
  if (reference_type !== "payment") return;
  const { payment_repository } = await import(
    "@/features/payment_management_system/payment/repositories/payment.repository"
  );
  const { payment_processing_service } = await import(
    "@/features/payment_management_system/payment/services/payment-processing.service"
  );
  const transaction = await payment_repository.find_transaction(reference_id);
  if (!transaction || !["pending", "processing"].includes(transaction.status)) return;
  await payment_processing_service.capture({
    transaction_id: reference_id,
    actor_user_id,
  });
}

async function publish_referenced_product(reference_type: string, reference_id: string) {
  if (reference_type !== "product") return;
  const { product_repository } = await import(
    "@/features/product_information_management/products/repositories/product.repository"
  );
  const product = await product_repository.find_by_id(reference_id);
  if (!product || product.status === "published") return;
  await product_repository.update(reference_id, { status: "published" });
}

async function activate_referenced_campaign(reference_type: string, reference_id: string) {
  if (reference_type !== "campaign") return;
  const { campaign_repository } = await import(
    "@/features/marketing/campaign/repositories/campaign.repository"
  );
  const { campaign_service } = await import(
    "@/features/marketing/campaign/services/campaign.service"
  );
  const campaign = await campaign_repository.get_by_id(reference_id);
  if (!campaign || !["draft", "scheduled", "paused"].includes(campaign.status)) return;
  await campaign_service.set_status({ id: reference_id, status: "active" });
}
