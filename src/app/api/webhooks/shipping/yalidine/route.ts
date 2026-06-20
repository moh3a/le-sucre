import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { rate_limit } from "@/lib/redis";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit-presets";
import { verify_hmac_signature, verify_webhook_timestamp } from "@/lib/security/webhook";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/error_handling";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "yalidine-webhook";
    const rl = await rate_limit(
      `webhook:yalidine:${ip}`,
      RATE_LIMIT_PRESETS.webhook.limit,
      RATE_LIMIT_PRESETS.webhook.window_sec,
    );
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const signature = request.headers.get("x-yalidine-signature");
    const timestamp = request.headers.get("x-yalidine-timestamp");

    if (!signature || !timestamp) {
      logger.warn("Yalidine webhook missing signature or timestamp");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!env.YALIDINE_WEBHOOK_SECRET) {
      logger.error("YALIDINE_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    if (!verify_webhook_timestamp(timestamp)) {
      logger.warn("Yalidine webhook expired timestamp");
      return NextResponse.json({ error: "Expired timestamp" }, { status: 401 });
    }

    const raw_body = await request.text();
    const signed_payload = `${timestamp}.${raw_body}`;
    const is_valid = verify_hmac_signature(
      signed_payload,
      signature,
      env.YALIDINE_WEBHOOK_SECRET,
      "sha256",
    );

    if (!is_valid) {
      logger.warn("Yalidine webhook invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { shipping_webhook_service } =
      await import("@/features/shipping_management_system/services/shipping-webhook.service");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await shipping_webhook_service.handle_provider_webhook(
      "yalidine",
      request.headers as any,
      raw_body,
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Yalidine webhook processing error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
