import type { ShippingProviderAdapter, ShippingProviderName } from "./contracts";
import { yalidine_adapter } from "./yalidine.adapter";

class PlaceholderAdapter implements ShippingProviderAdapter {
  constructor(public readonly name: ShippingProviderName) {}
  async quote() {
    throw new Error(`${this.name} adapter not implemented yet`);
  }
  async create_shipment() {
    throw new Error(`${this.name} adapter not implemented yet`);
  }
  async get_tracking() {
    throw new Error(`${this.name} adapter not implemented yet`);
  }
}

const registry = new Map<ShippingProviderName, ShippingProviderAdapter>([
  ["yalidine", yalidine_adapter],
  ["dhl", new PlaceholderAdapter("dhl")],
  ["fedex", new PlaceholderAdapter("fedex")],
  ["ups", new PlaceholderAdapter("ups")],
  ["ems", new PlaceholderAdapter("ems")],
]);

export function get_shipping_provider(provider: ShippingProviderName) {
  const adapter = registry.get(provider);
  if (!adapter) throw new Error(`Unsupported shipping provider: ${provider}`);
  return adapter;
}
