import "server-only";
import { PAYMENT_PROVIDER } from "../constants/payment-status";
import type { PaymentProviderAdapter, PaymentProviderName } from "./contracts";
import { stripe_adapter } from "./stripe.adapter";
import { paypal_adapter } from "./paypal.adapter";
import { manual_adapter } from "./manual.adapter";
import { PAYMENT_ERROR } from "../constants/error-codes";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";

const providers: Map<PaymentProviderName, PaymentProviderAdapter> = new Map();

export function register_payment_provider(adapter: PaymentProviderAdapter): void {
  providers.set(adapter.name, adapter);
}

export function get_payment_provider(name: PaymentProviderName): PaymentProviderAdapter {
  const adapter = providers.get(name);
  if (!adapter) {
    throw_error(PAYMENT_ERROR.PROVIDER_NOT_SUPPORTED, { provider: name });
  }
  return adapter;
}

export function get_available_providers(): PaymentProviderName[] {
  return Array.from(providers.keys());
}

register_payment_provider(stripe_adapter);
register_payment_provider(paypal_adapter);
register_payment_provider(manual_adapter);
