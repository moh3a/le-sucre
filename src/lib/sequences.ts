import { format, endOfMonth, differenceInSeconds } from "date-fns";
import { redis } from "@/lib/redis";

export interface SequenceConfig {
  /** Redis counter key namespace, e.g. "order", "task", "payment". */
  namespace: string;
  /** Leading identifier of the formatted number, e.g. "O", "BC", "SC". */
  prefix: string;
  /** Letters appended after the MMYY segment, e.g. "C", "CO", "FU". */
  letter: string;
  /** Minimum number of digits for the serial (defaults to 4). */
  pad?: number;
}

/**
 * Builds a human-friendly sequential identifier in the format
 * `<prefix>-<MMYY><letter><serial>`, e.g. `O-0726C0001`.
 *
 * The serial is an atomic monthly-reset counter stored in Redis. Counters are
 * namespaced per sequence config so every document type sequences independently.
 */
export async function build_sequence_number(config: SequenceConfig): Promise<string> {
  const now = new Date();
  const mm = format(now, "MM");
  const yy = format(now, "yy");
  const yyMM = `${yy}${mm}`;

  const key = `${config.namespace}:counter:${yyMM}`;
  const serial = await redis.incr(key);

  if (serial === 1) {
    const ttl = differenceInSeconds(endOfMonth(now), now) + 86400;
    await redis.expire(key, ttl);
  }

  const pad = config.pad ?? 4;
  return `${config.prefix}-${mm}${yy}${config.letter}${serial.toString().padStart(pad, "0")}`;
}
