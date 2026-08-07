"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";

/**
 * Bootstraps the storefront cart for the current visitor (guest or logged-in):
 * calls the REST endpoint that creates the cart if needed and persists it in the
 * `ls_cart_id` httpOnly cookie. The cookie is deliberately kept httpOnly, so the
 * id must be resolved server-side through this endpoint rather than read via JS.
 */
let bootstrap_cache: Promise<string> | null = null;

export function reset_cart_bootstrap(): void {
  bootstrap_cache = null;
}

export function ensure_cart_id(): Promise<string> {
  if (bootstrap_cache) return bootstrap_cache;
  bootstrap_cache = fetch("/api/storefront/cart", { credentials: "include" })
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to initialize cart");
      const body = (await res.json()) as { data?: { cart_id?: string } };
      const cart_id = body?.data?.cart_id ?? "";
      if (!cart_id) throw new Error("Failed to initialize cart");
      return cart_id;
    })
    .catch((error) => {
      bootstrap_cache = null;
      throw error;
    });
  return bootstrap_cache;
}

export function useStorefrontCart() {
  const t = useTranslations("cart");
  const utils = trpc.useUtils();
  const [cart_id, set_cart_id] = useState<string | null>(null);
  const [bootstrap_error, set_bootstrap_error] = useState<string | null>(null);

  const add_item_mutation = trpc.cart.addItem.useMutation();
  const add_product_mutation = trpc.cart.addProduct.useMutation();

  useEffect(() => {
    let alive = true;
    ensure_cart_id()
      .then((id) => {
        if (alive) set_cart_id(id);
      })
      .catch(() => {
        if (alive) set_bootstrap_error(t("bootstrap_error"));
      });
    return () => {
      alive = false;
    };
  }, [t]);

  const invalidate_cart = useCallback(() => {
    void utils.cart.getCart.invalidate();
  }, [utils]);

  const add_item = useCallback(
    async (input: { sku_id: string; quantity?: number }) => {
      try {
        const id = cart_id ?? (await ensure_cart_id());
        await add_item_mutation.mutateAsync({
          cart_id: id,
          sku_id: input.sku_id,
          quantity: input.quantity ?? 1,
        });
        await utils.cart.getCart.invalidate();
        toast.success(t("added_to_cart"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("add_failed"));
      }
    },
    [cart_id, add_item_mutation, utils, t],
  );

  const add_product = useCallback(
    async (input: { product_id: string; quantity?: number }) => {
      try {
        const id = cart_id ?? (await ensure_cart_id());
        await add_product_mutation.mutateAsync({
          cart_id: id,
          product_id: input.product_id,
          quantity: input.quantity ?? 1,
        });
        await utils.cart.getCart.invalidate();
        toast.success(t("added_to_cart"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("add_failed"));
      }
    },
    [cart_id, add_product_mutation, utils, t],
  );

  return { cart_id, bootstrap_error, add_item, add_product, invalidate_cart };
}
