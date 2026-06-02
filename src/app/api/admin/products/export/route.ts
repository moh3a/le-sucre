import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { product_admin_service } from "@/features/product_information_management/products/services/product-admin.service";
import { admin_list_products_dto } from "@/features/product_information_management/products/models/product-admin.dto";

export const GET = admin_route(async ({ req }) => {
  const url = new URL(req.url);
  const dto = admin_list_products_dto.parse(url.searchParams);
  const csv = await product_admin_service.export_csv({
    search: dto.search,
    status: dto.status,
    brand_id: dto.brand_id,
    category_id: dto.category_id,
    stock_status: dto.stock_status,
    price_min: dto.price_min,
    price_max: dto.price_max,
    rating_min: dto.rating_min,
    rating_max: dto.rating_max,
  }); 
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="products.csv"',
    },
  });
}, PERMISSIONS.products_read);
