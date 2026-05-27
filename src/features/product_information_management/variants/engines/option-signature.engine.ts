import type { OptionPair } from "../types";

export function build_option_signature(pairs: OptionPair[]): string {
  return pairs
    .slice()
    .sort((a, b) => a.property_code.localeCompare(b.property_code))
    .map((p) => `${p.property_code}:${p.value_code}`)
    .join("|");
}

export function parse_option_signature(signature: string): OptionPair[] {
  if (!signature) return [];
  return signature.split("|").map((part) => {
    const [property_code, value_code] = part.split(":");
    return { property_code, value_code };
  });
}

export function build_sku_code(parent_sku: string, signature: string): string {
  const suffix = signature.replace(/\|/g, "-").replace(/:/g, "_").toUpperCase();
  const raw = `${parent_sku}-${suffix}`;
  return raw.length > 128 ? raw.slice(0, 128) : raw;
}