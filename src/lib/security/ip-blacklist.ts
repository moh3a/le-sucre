import "server-only";
import { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";
import { ForbiddenError } from "@/lib/error_handling";

export function extract_client_ip(reqOrHeaders: Request | Headers): string {
  const headers = reqOrHeaders instanceof Request ? reqOrHeaders.headers : reqOrHeaders;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-client-ip") ??
    headers.get("x-cluster-client-ip") ??
    headers.get("x-forwarded") ??
    headers.get("forwarded-for") ??
    headers.get("forwarded") ??
    "unknown"
  );
}

export async function assert_ip_not_blacklisted(req: Request | { headers: Headers }): Promise<void> {
  const headers = req instanceof Request ? req.headers : req.headers;
  const ip = extract_client_ip(headers);

  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") {
    return;
  }

  const blocked = await ip_blacklist_service.is_blacklisted(ip);
  if (blocked) {
    throw new ForbiddenError(
      "Votre adresse IP a été bloquée. / Your IP address has been blocked. / تم حظر عنوان IP الخاص بك.",
    );
  }
}

export { ip_blacklist_service } from "@/features/ip_blacklist/services/blacklist.service";
