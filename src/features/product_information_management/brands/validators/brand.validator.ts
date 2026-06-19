import { z } from "zod";

export const brand_slug_regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const brand_slug_validator = z
  .string()
  .min(2)
  .max(255)
  .regex(brand_slug_regex, "Le slug doit être en minuscules, avec des tirets");

export const brand_url_validator = z.string().url().optional().nullable();
