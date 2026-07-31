import { build_sequence_number } from "@/lib/sequences";

export async function build_order_number(): Promise<string> {
  return build_sequence_number({ namespace: "order", prefix: "O", letter: "C" });
}
