import { build_sequence_number } from "@/lib/sequences";

export async function build_payment_id(): Promise<string> {
  return build_sequence_number({ namespace: "payment", prefix: "P", letter: "P" });
}
