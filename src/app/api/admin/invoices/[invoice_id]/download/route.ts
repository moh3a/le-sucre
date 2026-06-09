import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apply_api_guards } from "@/features/authentication_and_authorization/authorization/middleware/api-guards";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { invoice_service } from "@/features/billing_and_finance_system/services/invoice.service";
import { pdf_generation_service } from "@/features/billing_and_finance_system/services/pdf_generation.service";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";

export async function GET(req: Request, props: { params: Promise<{ invoice_id: string }> }) {
  const { invoice_id } = await props.params;
  try {
    await apply_api_guards(req, "admin");

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const authz = new AuthorizationService();
    try {
      await authz.assert_admin_console(session.user.id);
    } catch {
      return new NextResponse("Accès réservé aux administrateurs", { status: 403 });
    }

    const invoice = await invoice_service.find_by_id(invoice_id);
    if (!invoice) {
      return new NextResponse("Facture introuvable", { status: 404 });
    }

    const order_details = await order_repository.get_full(invoice.order_id);

    const pdf_buffer = await pdf_generation_service.generate_invoice_pdf({
      ...invoice,
      order_number: order_details?.order?.order_number,
    });

    return new Response(pdf_buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Admin PDF download error:", err);
    return new NextResponse("Erreur lors de la génération du document", { status: 500 });
  }
}
