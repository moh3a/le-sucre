import "server-only";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { CUSTOMER_ERROR } from "../constants/error-codes";
import { customer_repository } from "../repositories/customer.repository";
import { cart_repository } from "../../carts/repository";
import { order_repository } from "../../orders/repositories/order.repository";
import { review_repository } from "@/features/product_reviews_management/repositories/review.repository";
import { return_repository } from "@/features/order_management_system/return_replacement/repositories/return.repository";
import { promotion_repository } from "@/features/order_management_system/promotions/repositories/promotion.repository";
import { WishlistRepository } from "@/features/wishlist_management_system/repositories/wishlist.repository";
import { WishlistItemRepository } from "@/features/wishlist_management_system/repositories/wishlist_item.repository";
import { FavoritesRepository } from "@/features/wishlist_management_system/repositories/favorites.repository";
import { SaveForLaterRepository } from "@/features/wishlist_management_system/repositories/save_for_later.repository";

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

  async get_full_detail(user_id: string) {
    const customer = await this.get(user_id);
    const wishlist_repo = new WishlistRepository();
    const wishlist_item_repo = new WishlistItemRepository();
    const favorites_repo = new FavoritesRepository();
    const saved_repo = new SaveForLaterRepository();

    const [
      carts,
      orders,
      reviews,
      return_requests,
      promo_redemptions,
      wishlists,
      favorites,
      saved_items,
    ] = await Promise.all([
      cart_repository.find_by_user_id(user_id),
      order_repository.find_by_user_id(user_id),
      review_repository.list_by_user_all(user_id),
      return_repository.find_by_user_id(user_id),
      promotion_repository.find_redemptions_by_user_id(user_id),
      wishlist_repo.find_by_customer(user_id),
      favorites_repo.list_by_customer(user_id, 1, 100),
      saved_repo.list_by_customer_all(user_id),
    ]);

    const wishlists_with_items = await Promise.all(
      wishlists.map(async (wl) => {
        const items = await wishlist_item_repo.list_by_wishlist_all(wl.id);
        return { ...wl, items };
      }),
    );

    return {
      customer,
      carts,
      orders,
      reviews,
      return_requests,
      promo_redemptions,
      wishlists: wishlists_with_items,
      favorites,
      saved_items,
    };
  }

  stats() {
    return customer_repository.stats();
  }
}

export const customer_service = new CustomerService();
