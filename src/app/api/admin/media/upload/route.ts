import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { media_service } from "@/features/media_library/services/media.service";
import {
  enforce_upload_rate_limit,
  check_user_upload_quota,
  track_upload_quota,
  sanitize_filename,
} from "@/features/media_library/helpers";
import { MEDIA_ERROR, UPLOAD_LIMITS } from "@/features/media_library/constants";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

export async function POST(req: Request) {
  return admin_route(async ({ user }) => {
    const rate_ok = await enforce_upload_rate_limit(user.id);
    if (!rate_ok) throw_error(MEDIA_ERROR.RATE_LIMITED);

    const form_data = await req.formData();

    const files = form_data.getAll("file");
    if (files.length === 0) {
      return Response.json(
        { success: false, error: { code: "FILE_REQUIRED", message: "A file is required." } },
        { status: 400 },
      );
    }

    if (files.length > UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD) {
      return Response.json(
        {
          success: false,
          error: { code: "TOO_MANY_FILES", message: `Max ${UPLOAD_LIMITS.MAX_FILES_PER_UPLOAD} files per upload.` },
        },
        { status: 400 },
      );
    }

    const results = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const quota = await check_user_upload_quota(user.id, file.size);
      if (!quota.allowed) {
        throw_error({
          ...MEDIA_ERROR.QUOTA_EXCEEDED,
          message: { fr: quota.reason ?? "Quota dépassé", en: quota.reason ?? "Quota exceeded", ar: "تجاوز الحد المسموح" },
        });
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
      const skip_optimization = form_data.get("skip_optimization") === "true";

      const result = await media_service.upload_file(file, {
        alt: alt ?? null,
        caption: caption ?? null,
        width: width ?? null,
        height: height ?? null,
        is_public,
        uploaded_by: user.id,
        skip_optimization,
      });

      await track_upload_quota(user.id, file.size);

      if (entity_type && entity_id) {
        await media_service.attach_to_entity(result.id, {
          entity_type,
          entity_id,
          field,
          is_primary,
          sort_order: 0,
        });
      }

      results.push(result);
    }

    return { success: true, data: results.length === 1 ? results[0] : results };
  }, PERMISSIONS.products_write)(req);
}
