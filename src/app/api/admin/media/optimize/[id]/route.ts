import { admin_route } from "@/lib/api/admin-handler";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { media_service } from "@/features/media_library/services/media.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return admin_route(async () => {
    const { id } = await params;
    const variants = await media_service.generate_variants(id);
    return { success: true, data: { variants } };
  }, PERMISSIONS.products_write)(req);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return admin_route(async () => {
    const { id } = await params;
    const variants = await media_service.regenerate_variants(id);
    return { success: true, data: { variants } };
  }, PERMISSIONS.products_write)(req);
}
