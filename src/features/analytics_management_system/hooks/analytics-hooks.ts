import { event_ingestion_service } from "../services/event-ingestion.service";

/**
 * Analytics Integration Hooks
 * 
 * These hooks should be called at the appropriate points in the application
 * to track user behavior and events for analytics.
 */

/**
 * Track product view event
 * Call this when a user views a product PDP
 */
export async function track_product_view(product_id: string, user_id?: string | null) {
  void event_ingestion_service.track({
    event_type: "product_view",
    product_id,
    user_id,
  });
}

/**
 * Track add to cart event
 * Call this when a user adds an item to cart
 */
export async function track_add_to_cart(product_id: string, sku_id: string, quantity: number, user_id?: string | null) {
  void event_ingestion_service.track({
    event_type: "add_to_cart",
    product_id,
    sku_id,
    quantity,
    user_id,
  });
}

/**
 * Track checkout started event
 * Call this when a user starts checkout
 */
export async function track_checkout_started(user_id?: string | null, cart_id?: string) {
  void event_ingestion_service.track({
    event_type: "checkout_started",
    user_id,
    cart_id,
  });
}

/**
 * Track purchase event
 * Call this when an order is completed/paid
 */
export async function track_purchase(order_id: string, revenue: string, lines: Array<{ product_id: string; sku_id: string; quantity: number }>, user_id?: string | null) {
  void event_ingestion_service.track_purchase({
    order_id,
    user_id,
    revenue,
    lines,
  });
}

/**
 * Track search event
 * Call this when a user performs a catalog search
 */
export async function track_search(query: string, result_count: number, user_id?: string | null) {
  void event_ingestion_service.track({
    event_type: "search",
    user_id,
    metadata: { query, result_count },
  });
}

/**
 * Track recommendation click event
 * Call this when a user clicks on a recommended product
 */
export async function track_recommendation_click(product_id: string, recommendation_type: string, user_id?: string | null) {
  void event_ingestion_service.track({
    event_type: "recommendation_click",
    product_id,
    user_id,
    metadata: { recommendation_type },
  });
}

/**
 * Track cart abandoned event
 * This should be called by a background job when a cart is inactive > 1h
 */
export async function track_cart_abandoned(cart_id: string, user_id?: string | null) {
  void event_ingestion_service.track({
    event_type: "cart_abandoned",
    user_id,
    cart_id,
  });
}
