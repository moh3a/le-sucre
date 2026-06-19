import { z } from "zod";

export const wishlist_name_regex = /^[a-zA-Z0-9\s\-_']+$/;
export const wishlist_slug_regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const wishlist_name_validator = z
  .string()
  .min(1)
  .max(255)
  .regex(wishlist_name_regex, "Name contains invalid characters");

export const wishlist_slug_validator = z
  .string()
  .min(1)
  .max(255)
  .regex(wishlist_slug_regex, "Slug must be lowercase alphanumeric with hyphens");
