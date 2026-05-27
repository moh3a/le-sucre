import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { product_media_service } from "@/features/product_information_management/products/services/product_media.service";

type RouteContext = { params: Promise<{ product_id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const { product_id } = await context.params;
  return admin_route(async ({ req: request }) => {
    const form_data = await request.formData();
    const file = form_data.get("file");
    if (!(file instanceof File)) {
      throw new Error("Fichier requis");
    }
    const saved = await product_media_service.save_local_file(product_id, file);
    const is_primary = form_data.get("is_primary") === "true";
    const alt = (form_data.get("alt") as string | null) ?? saved.filename;
    const media = await product_media_service.attach_media({
      product_id,
      url: saved.public_url,
      filename: saved.filename,
      mime_type: saved.mime_type,
      kind: saved.mime_type.startsWith("video/") ? "video" : "image",
      alt,
      sort_order: Number(form_data.get("sort_order") ?? 0),
      is_primary,
      metadata: {
        storage_key: saved.storage_key,
        size: saved.size,
        provider: "local",
      },
    });
    return { saved, media };
  }, PERMISSIONS.products_write)(req);
}
