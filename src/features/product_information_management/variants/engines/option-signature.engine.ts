export function build_option_signature(
  pairs: Array<{ property_code: string; value_code: string }>,
): string {
  return pairs
    .sort((a, b) => a.property_code.localeCompare(b.property_code))
    .map((p) => `${p.property_code}:${p.value_code}`)
    .join("|");
}

export function build_sku_code(parent_sku: string, signature: string): string {
  const suffix = signature.replace(/\|/g, "-").replace(/:/g, "_").toUpperCase();
  return `${parent_sku}-${suffix}`.slice(0, 128);
}
