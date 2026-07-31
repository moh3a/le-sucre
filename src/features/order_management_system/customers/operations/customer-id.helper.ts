import { build_sequence_number } from "@/lib/sequences";

export async function build_contact_id(): Promise<string> {
  return build_sequence_number({ namespace: "customer_contact", prefix: "CO", letter: "CO" });
}

export async function build_note_id(): Promise<string> {
  return build_sequence_number({ namespace: "customer_note", prefix: "CN", letter: "CN" });
}

export async function build_follow_up_id(): Promise<string> {
  return build_sequence_number({ namespace: "customer_follow_up", prefix: "FU", letter: "FU" });
}

export async function build_support_case_id(): Promise<string> {
  return build_sequence_number({ namespace: "customer_support_case", prefix: "SC", letter: "SC" });
}
