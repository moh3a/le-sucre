import "server-only";
import { create_trpc_router, t_instance } from "./router";
import {
  admin_auth_router,
  auth_router,
} from "@/features/authentication_and_authorization/auth/router";
import { authorization_router } from "@/features/authentication_and_authorization/authorization/router";
import { brand_router } from "@/features/product_information_management/brands/router";
import { category_router } from "@/features/product_information_management/categories/router";
import { product_router } from "@/features/product_information_management/products/router";
import { variants_router } from "@/features/product_information_management/variants/router";
import { catalog_router } from "@/features/product_information_management/catalog_discovery/router";
import { recommendations_router } from "@/features/product_information_management/recommendations/router";
import { reviews_router } from "@/features/product_reviews_management/router";
import { inventory_router } from "@/features/inventory_management_system/inventory/router";
import { forecast_router } from "@/features/inventory_management_system/forecasting/router";
import { warehouse_router } from "@/features/inventory_management_system/warehouses/router";
import { cart_router } from "@/features/order_management_system/carts/router";
import { checkout_router } from "@/features/order_management_system/checkout/router";
import { order_router } from "@/features/order_management_system/orders/router";
import { preorder_router } from "@/features/order_management_system/preorders/router";
import { customers_router } from "@/features/order_management_system/customers/router";
import { promotion_router } from "@/features/order_management_system/promotions/router";
import { return_replacement_router } from "@/features/order_management_system/return_replacement/router";
import { analytics_router } from "@/features/analytics_management_system/router";
import { shipping_router } from "@/features/shipping_management_system/router";
import { invoice_router } from "@/features/billing_and_finance_system/routers/invoice.router";
import { campaign_router } from "@/features/campaign_management_system/router";
import { order_operations_router } from "@/features/order_management_system/orders/operations/routers/order-operations.router";
import { customer_relations_router } from "@/features/order_management_system/customers/operations/routers/customer-relations.router";
import { warranty_router } from "@/features/order_management_system/warranty/routers/warranty.router";
import { promotion_review_router } from "@/features/order_management_system/promotions/operations/routers/promotion-review.router";
import { delivery_operations_router } from "@/features/shipping_management_system/operations/routers/delivery.router";
import { inventory_adjustment_router } from "@/features/inventory_management_system/inventory/operations/routers/inventory-adjustment.router";
import { payment_operations_router } from "@/features/payment_management_system/operations/routers/payment-operations.router";
import { product_workflow_router } from "@/features/product_information_management/products/operations/routers/product-workflow.router";
import { admin_task_router } from "@/features/console_dashboard/tasks/routers/admin-task.router";
import { notification_router } from "@/features/console_dashboard/notifications/routers/notification.router";
import { payment_router } from "@/features/payment_management_system/router";
import { wishlist_management_router } from "@/features/wishlist_management_system/router";
import { feature_flag_router } from "@/features/feature_flag_system/router";
import { media_router } from "@/features/media_library/routers/media.router";
import { blacklist_router } from "@/features/ip_blacklist/routers/blacklist.router";
import { operations_workflows_router } from "@/features/operations_workflows/router";
import {
  profile_router,
  admin_profile_router,
} from "@/features/authentication_and_authorization/profile/routers/profile.router";
import { health_router } from "@/features/monitoring/health/routers/health.router";
import { dashboard_router } from "@/features/customer_dashboard/routers/dashboard.router";

export const app_router = create_trpc_router({
  auth: auth_router,
  authorization: authorization_router,
  adminAuth: admin_auth_router,
  brands: brand_router,
  categories: category_router,
  products: product_router,
  variants: variants_router,
  recommendations: recommendations_router,
  catalog: catalog_router,
  reviews: reviews_router,
  inventory: inventory_router,
  forecast: forecast_router,
  warehouses: warehouse_router,
  cart: cart_router,
  checkout: checkout_router,
  orders: order_router,
  preorders: preorder_router,
  customers: customers_router,
  promotions: promotion_router,
  returns: return_replacement_router,
  analytics: analytics_router,
  shipping: shipping_router,
  invoices: invoice_router,
  campaigns: campaign_router,
  operations: t_instance.mergeRouters(
    order_operations_router,
    customer_relations_router,
    warranty_router,
    promotion_review_router,
    delivery_operations_router,
    inventory_adjustment_router,
    payment_operations_router,
    product_workflow_router,
    admin_task_router,
    notification_router,
  ),
  payments: payment_router,
  wishlistManagement: wishlist_management_router,
  featureFlags: feature_flag_router,
  media: media_router,
  profile: profile_router,
  adminProfile: admin_profile_router,
  blacklist: blacklist_router,
  operationsWorkflows: operations_workflows_router,
  health: health_router,
  dashboard: dashboard_router,
});

export type AppRouter = typeof app_router;
