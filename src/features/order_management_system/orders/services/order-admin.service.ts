import "server-only";
import { order_admin_repository } from "../repositories/order-admin.repository";

export class OrderAdminService {
  stats() {
    return order_admin_repository.stats();
  }

  // TODO wire order_admin_service from order_admin_repository and it should be similar to product_admin_service
}

export const order_admin_service = new OrderAdminService();
