import "dotenv/config";
import { z } from "zod";

const media_env_schema = z.object({
  MEDIA_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000/media"),
  MEDIA_STORAGE_ROOT: z.string().default("public/media"),
});

const parsed = media_env_schema.safeParse(process.env);

export const media_config = parsed.success
  ? parsed.data
  : {
      MEDIA_PUBLIC_BASE_URL: "http://localhost:3000/media",
      MEDIA_STORAGE_ROOT: "public/media",
    };

export function build_product_media_key(product_id: string, filename: string) {
  const safe_name = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `products/${product_id}/${Date.now()}-${safe_name}`;
}

export function build_public_media_url(storage_key: string) {
  return `${media_config.MEDIA_PUBLIC_BASE_URL}/${storage_key}`;
}
