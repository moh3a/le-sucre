import "server-only";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { CUSTOMER_ERROR } from "../constants/error-codes";
import { customer_repository } from "../repositories/customer.repository";

// Segmentation thresholds
const VIP_THRESHOLD = 50_000; // DZD — total_spent > 50 000 → VIP
const REPEAT_THRESHOLD = 3; // total_orders >= 3 → repeat, else new

function segment(total_spent: string, total_orders: number): "vip" | "repeat" | "new" {
  if (Number(total_spent) >= VIP_THRESHOLD) return "vip";
  if (total_orders >= REPEAT_THRESHOLD) return "repeat";
  return "new";
}

export class CustomerService {
  async list(page: number, limit: number) {
    const result = await customer_repository.list(page, limit);
    const items = result.items.map((c) => ({
      ...c,
      segment: segment(c.total_spent, c.total_orders),
      average_order_value:
        c.total_orders > 0 ? (Number(c.total_spent) / c.total_orders).toFixed(2) : "0.00",
    }));
    return { items, meta: result.meta };
  }

  async get(user_id: string) {
    const customer = await customer_repository.find_by_id(user_id);
    if (!customer) throw_error(CUSTOMER_ERROR.NOT_FOUND);
    return {
      ...customer,
      segment: segment(customer.total_spent, customer.total_orders),
      average_order_value:
        customer.total_orders > 0
          ? (Number(customer.total_spent) / customer.total_orders).toFixed(2)
          : "0.00",
      lifetime_value: customer.total_spent,
    };
  }

  stats() {
    return customer_repository.stats();
  }
}

export const customer_service = new CustomerService();
