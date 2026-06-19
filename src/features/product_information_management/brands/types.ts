import type { brands } from "./schema";

export type Brand = typeof brands.$inferSelect;

export type BrandRecord = Brand;

export type BrandStats = {
  total: number;
  active: number;
  inactive: number;
  total_products: number;
};
