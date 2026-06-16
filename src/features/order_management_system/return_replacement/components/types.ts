import type { return_requests } from "../schema";

export type ReturnRequestRow = typeof return_requests.$inferSelect & {
  items: Array<{
    sku_id: string;
    product_name: string;
    sku_code: string;
    quantity: number;
    unit_price: string;
    condition?: string;
  }>;
};

export type OrderItemInfo = {
  id: string;
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: string;
};
