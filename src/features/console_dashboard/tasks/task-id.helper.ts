import { build_sequence_number } from "@/lib/sequences";

export async function build_task_id(): Promise<string> {
  return build_sequence_number({ namespace: "task", prefix: "T", letter: "T" });
}
