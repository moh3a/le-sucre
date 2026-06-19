import { json_ok, json_error } from "@/lib/http";
import { payment_webhook_service } from "@/features/payment_management_system/services/payment-webhook.service";
import type { PaymentProviderName } from "@/features/payment_management_system/providers/contracts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;
    const raw = await request.text();
    const result = await payment_webhook_service.handle_provider_webhook(
      provider as PaymentProviderName,
      request.headers,
      raw,
    );
    return json_ok(result);
  } catch (e) {
    return json_error(e);
  }
}
