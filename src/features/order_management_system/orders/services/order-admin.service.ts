import "server-only";
import { order_admin_repository } from "../repositories/order-admin.repository";

export class OrderAdminService {
  stats() {
    return order_admin_repository.stats();
  }

  list_enriched(input: {
    page: number;
    limit: number;
    status?: string;
    payment_status?: string;
    fulfillment_status?: string;
    from?: string;
    to?: string;
  }) {
    return order_admin_repository.list_enriched(input);
  }

  async charts(days = 30) {
    const [series, distribution] = await Promise.all([
      order_admin_repository.revenue_series(days),
      order_admin_repository.status_distribution(),
    ]);
    return { series, distribution };
  }
}

export const order_admin_service = new OrderAdminService();
