import z from "zod";

export const shippingProviderNames = ["yalidine", "dhl", "fedex", "ups", "ems"] as const;
export const shippingProviderNamesSchema = z.enum(shippingProviderNames);
export type ShippingProviderName = z.infer<typeof shippingProviderNamesSchema>;
