import { NextRequest, NextResponse } from "next/server";
import { rate_limit } from "@/lib/redis";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit-presets";
import { verify_stripe_signature } from "@/lib/security/webhook";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";
import {
  paymentProviders,
  paymentProvidersSchema,
} from "@/features/payment_management_system/constants/payment-status";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;
    const providerName = paymentProvidersSchema.parse(provider);
    if (!paymentProviders.includes(providerName as (typeof paymentProviders)[number])) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? `${providerName}-webhook`;
    const rl = await rate_limit(
      `webhook:${providerName}:${ip}`,
      RATE_LIMIT_PRESETS.webhook.limit,
      RATE_LIMIT_PRESETS.webhook.window_sec,
    );
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const raw_body = await request.text();

    if (providerName === "stripe") {
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }
      if (!env.STRIPE_WEBHOOK_SECRET) {
        logger.error("STRIPE_WEBHOOK_SECRET not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
      }
      const result = verify_stripe_signature(raw_body, signature, env.STRIPE_WEBHOOK_SECRET);
      if (!result.valid) {
        logger.warn("Stripe webhook invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    if (providerName === "paypal") {
      const transmission_id = request.headers.get("paypal-transmission-id");
      const transmission_sig = request.headers.get("paypal-transmission-sig");
      const cert_url = request.headers.get("paypal-cert-url");
      const auth_algo = request.headers.get("paypal-auth-algo");
      if (!transmission_id || !transmission_sig || !cert_url || !auth_algo) {
        logger.warn("PayPal webhook missing verification headers");
        return NextResponse.json({ error: "Missing PayPal headers" }, { status: 401 });
      }
    }

    const payload = JSON.parse(raw_body);
    const { payment_webhook_service } =
      await import("@/features/payment_management_system/services/payment-webhook.service");
    const result = await payment_webhook_service.handle_provider_webhook(
      providerName,
      request.headers,
      raw_body,
    );

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Payment webhook processing error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
