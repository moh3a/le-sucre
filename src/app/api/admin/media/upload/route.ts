import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { media_service } from "@/features/media_library/services/media.service";

export async function POST(req: Request) {
  return admin_route(async ({ user }) => {
    const form_data = await req.formData();
    const file = form_data.get("file");
    if (!(file instanceof File)) {
      return Response.json(
        { success: false, error: { code: "FILE_REQUIRED", message: "A file is required." } },
        { status: 400 },
      );
    }

    const alt = (form_data.get("alt") as string | null) ?? undefined;
    const caption = (form_data.get("caption") as string | null) ?? undefined;
    const width = form_data.get("width")
      ? Number(form_data.get("width"))
      : undefined;
    const height = form_data.get("height")
      ? Number(form_data.get("height"))
      : undefined;
    const is_public = form_data.get("is_public") !== "false";
    const entity_type = form_data.get("entity_type") as string | null;
    const entity_id = form_data.get("entity_id") as string | null;
    const field = form_data.get("field") as string | null;
    const is_primary = form_data.get("is_primary") === "true";

    const result = await media_service.upload_file(file, {
      alt: alt ?? null,
      caption: caption ?? null,
      width: width ?? null,
      height: height ?? null,
      is_public,
      uploaded_by: user.id,
    });

    if (entity_type && entity_id) {
      await media_service.attach_to_entity(result.id, {
        entity_type,
        entity_id,
        field,
        is_primary,
        sort_order: 0,
      });
    }

    return { success: true, data: result };
  }, PERMISSIONS.products_write)(req);
}
