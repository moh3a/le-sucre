import { format, endOfMonth, differenceInSeconds } from "date-fns";
import { redis } from "@/lib/redis";

export async function build_order_number(): Promise<string> {
  const now = new Date();
  const mm = format(now, "MM");
  const yy = format(now, "yy");
  const yyMM = `${yy}${mm}`;

  const key = `order:counter:${yyMM}`;
  const serial = await redis.incr(key);

  if (serial === 1) {
    const ttl = differenceInSeconds(endOfMonth(now), now) + 86400;
    await redis.expire(key, ttl);
  }

  return `O-${mm}${yy}C${serial.toString().padStart(4, "0")}`;
}
