import "server-only";
import { inventory_admin_repository } from "../repositories/inventory-admin.repository";

export class InventoryAdminService {
  stats() {
    return inventory_admin_repository.stats();
  }

  list_stock(input: {
    page: number;
    limit: number;
    warehouse_id?: string;
    search?: string;
    low_stock?: boolean;
    out_of_stock?: boolean;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
  }) {
    return inventory_admin_repository.list_stock(input);
  }

  list_movements(input: {
    page: number;
    limit: number;
    warehouse_id?: string;
    movement_type?: string;
    from?: string;
    to?: string;
  }) {
    return inventory_admin_repository.list_movements(input);
  }

  async charts(days = 30) {
    return inventory_admin_repository.charts(days);
  }
}

export const inventory_admin_service = new InventoryAdminService();
