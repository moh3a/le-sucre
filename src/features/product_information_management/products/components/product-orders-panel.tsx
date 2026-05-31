"use client";

import { trpc } from "@/components/providers/app-providers";
import { OrderTable } from "@/features/order_management_system/orders/components/order-table";

// TODO make a copy of order data table that works with format

export function ProductOrdersPanel({ product_id }: { product_id: string }) {
  const { data } = trpc.orders.adminListByProduct.useQuery({ product_id, page: 1, limit: 10 });
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {data?.meta.total_records ?? 0} commande(s) contenant ce produit
      </p>
      <OrderTable compact orders={data ?? []} />
    </div>
  );
}
