import { build_sequence_number } from "@/lib/sequences";

export async function build_po_id(): Promise<string> {
  return build_sequence_number({ namespace: "purchase_order", prefix: "BC", letter: "BC" });
}
