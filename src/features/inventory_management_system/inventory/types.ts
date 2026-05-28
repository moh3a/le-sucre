export type InventoryLevelRow = {
  id: string;
  sku_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  version: number;
};

export type InventoryMovementRow = {
  id: string;
  sku_id: string;
  warehouse_id: string;
  movement_type: string;
  quantity_delta: number;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
};

export type ProductSkuStockRow = {
  sku_id: string;
  sku_code: string;
  stock_available: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  warehouse_id: string;
};
