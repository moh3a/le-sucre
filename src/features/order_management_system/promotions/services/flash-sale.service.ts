import "server-only";
import { flash_sale_repository } from "../repositories/flash-sale.repository";

export class FlashSaleService {
  list_storefront() {
    return flash_sale_repository.list_storefront();
  }
}

export const flash_sale_service = new FlashSaleService();
