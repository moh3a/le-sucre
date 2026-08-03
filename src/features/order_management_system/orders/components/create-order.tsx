"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Plus, Trash2, Search, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/features/order_management_system/customers/components/customer-combobox";

type CartLineItem = {
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: number;
};

export function CreateOrderDialog() {
  const t = useTranslations("orders");

  type FormValues = {
    user_id: string;
    shipping_full_name: string;
    shipping_phone: string;
    shipping_line1: string;
    shipping_line2?: string;
    shipping_city: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_country_code: string;
    notes?: string;
  };

  const form_schema = useMemo(
    () =>
      z.object({
        user_id: z.string().min(1, t("select_client_validation")),
        shipping_full_name: z.string().min(2, t("shipping_name_validation")).max(255),
        shipping_phone: z.string().min(6, t("shipping_phone_validation")).max(32),
        shipping_line1: z.string().min(3, t("shipping_address_validation")).max(255),
        shipping_line2: z.string().max(255).optional(),
        shipping_city: z.string().min(2, t("shipping_city_validation")).max(128),
        shipping_state: z.string().max(128).optional(),
        shipping_postal_code: z.string().max(32).optional(),
        shipping_country_code: z.string().length(2),
        notes: z.string().max(4096).optional(),
      }),
    [t],
  );

  const [open, set_open] = useState(false);
  const [cart_items, set_cart_items] = useState<CartLineItem[]>([]);
  const [search_query, set_search_query] = useState("");
  const [selected_sku_id, set_selected_sku_id] = useState("");
  const [selected_qty, set_selected_qty] = useState(1);
  const [selected_address_id, set_selected_address_id] = useState("__new__");

  const form = useForm<FormValues>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      user_id: "",
      shipping_full_name: "",
      shipping_phone: "",
      shipping_line1: "",
      shipping_line2: "",
      shipping_city: "",
      shipping_state: "",
      shipping_postal_code: "",
      shipping_country_code: "DZ",
      notes: "",
    },
  });

  const { control, formState, watch, reset } = form;
  const selected_user_id = watch("user_id");

  const utils = trpc.useUtils();

  const { data: profile_data } = trpc.adminProfile.getByUserId.useQuery(
    { user_id: selected_user_id },
    { enabled: !!selected_user_id },
  );

  const { data: customers_data } = trpc.customers.adminList.useQuery(
    { page: 1, limit: 100 },
    { enabled: !!selected_user_id },
  );

  const selected_customer = customers_data?.items?.find((c) => c.user_id === selected_user_id);
  const selected_customer_name = selected_customer?.name ?? "";

  const { data: skus_data } = trpc.variants.adminList.useQuery(
    { page: 1, limit: 20, search: search_query || undefined },
    { enabled: open && search_query.length > 0 },
  );

  const create_mutation = trpc.orders.adminCreateOrder.useMutation({
    onSuccess: (order) => {
      const order_number =
        typeof order === "object" && order !== null && "order" in order
          ? (order as { order: { order_number: string } }).order.order_number
          : "";
      toast.success(t("order_created_success", { number: order_number }));
      utils.orders.adminList.invalidate();
      utils.orders.adminStats.invalidate();
      utils.orders.adminCharts.invalidate();
      set_open(false);
      form.reset();
      set_cart_items([]);
      set_search_query("");
      set_selected_address_id("__new__");
    },
    onError: (err) => {
      toast.error(err.message || t("create_order_error"));
    },
  });

  const is_pending = create_mutation.isPending;

  const sku_options = (skus_data?.items ?? []).map(
    (s: {
      id: string;
      sku_code: string;
      stock_available: number;
      product_name: string | null;
      base_price?: string | null;
      offer_price?: string | null;
    }) => ({
      sku_id: s.id,
      sku_code: s.sku_code,
      product_name: s.product_name ?? s.sku_code,
      unit_price: Number(s.offer_price ?? s.base_price ?? 0),
      stock_available: s.stock_available,
    }),
  );

  const filtered_sku_options = sku_options.filter(
    (s) =>
      !cart_items.some((c) => c.sku_id === s.sku_id) &&
      !!s.stock_available &&
      (s.sku_code.toLowerCase().includes(search_query.toLowerCase()) ||
        s.product_name.toLowerCase().includes(search_query.toLowerCase())),
  );

  function add_to_cart() {
    const sku = sku_options.find((s) => s.sku_id === selected_sku_id);
    if (!sku) return;
    set_cart_items((prev) => {
      const existing = prev.find((i) => i.sku_id === sku.sku_id);
      if (existing) {
        return prev.map((i) =>
          i.sku_id === sku.sku_id ? { ...i, quantity: i.quantity + selected_qty } : i,
        );
      }
      return [
        ...prev,
        {
          sku_id: sku.sku_id,
          product_name: sku.product_name,
          sku_code: sku.sku_code,
          quantity: selected_qty,
          unit_price: sku.unit_price,
        },
      ];
    });
    set_selected_sku_id("");
    set_selected_qty(1);
  }

  function remove_from_cart(sku_id: string) {
    set_cart_items((prev) => prev.filter((i) => i.sku_id !== sku_id));
  }

  useEffect(() => {
    if (selected_user_id && !form.getValues("shipping_full_name")) {
      const profile_name = [profile_data?.profile?.first_name, profile_data?.profile?.last_name]
        .filter(Boolean)
        .join(" ");
      form.setValue("shipping_full_name", selected_customer_name || profile_name);
    }
  }, [selected_user_id, selected_customer_name, profile_data, form]);

  useEffect(() => {
    set_selected_address_id("__new__");
  }, [selected_user_id]);

  const cart_subtotal = cart_items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const on_submit = async (values: FormValues) => {
    if (cart_items.length === 0) {
      toast.error(t("order_must_have_items"));
      return;
    }

    await create_mutation.mutateAsync({
      user_id: values.user_id,
      items: cart_items.map((i) => ({ sku_id: i.sku_id, quantity: i.quantity })),
      shipping_address: {
        full_name: values.shipping_full_name,
        phone: values.shipping_phone,
        line1: values.shipping_line1,
        line2: values.shipping_line2 || null,
        city: values.shipping_city,
        state: values.shipping_state || null,
        postal_code: values.shipping_postal_code || null,
        country_code: values.shipping_country_code,
      },
      billing_address: undefined,
      shipping_cost: 0,
      notes: values.notes || undefined,
    });
  };

  return (
    <QueryGuard mutation={create_mutation}>
      <Dialog open={open} onOpenChange={set_open}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("new_order")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("new_order")}</DialogTitle>
            <DialogDescription>{t("create_order_desc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
            {/* Customer selection */}

            {/* Product search and add */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base capitalize">{t("articles")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FieldLabel>{t("search_product_sku")}</FieldLabel>
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        className="pl-8"
                        placeholder={t("product_sku_placeholder")}
                        value={search_query}
                        onChange={(e) => {
                          set_search_query(e.target.value);
                          set_selected_sku_id("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                {search_query && (
                  <div className="space-y-2">
                    {filtered_sku_options.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t("no_results")}</p>
                    ) : (
                      <div className="max-h-50 space-y-1 overflow-y-auto rounded-md border p-2">
                        {filtered_sku_options.slice(0, 10).map((sku) => (
                          <label
                            key={sku.sku_id}
                            className={cn(
                              `hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded p-2 text-sm`,
                              selected_sku_id === sku.sku_id ? "bg-muted/60" : "",
                              !sku.stock_available && "bg-muted text-muted-foreground cursor-none",
                            )}
                          >
                            <input
                              type="radio"
                              name="sku_select"
                              checked={selected_sku_id === sku.sku_id}
                              disabled={!sku.stock_available}
                              onChange={() => set_selected_sku_id(sku.sku_id)}
                              className="text-primary"
                            />
                            <div className="flex flex-1 items-center justify-between">
                              <div>
                                <span className="font-medium">{sku.product_name}</span>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {sku.sku_code}
                                </span>
                              </div>
                              <span className="font-mono text-xs tabular-nums">
                                {sku.unit_price.toLocaleString("fr-DZ")} DZD
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {selected_sku_id && (
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Input
                            type="number"
                            min={1}
                            max={99}
                            value={selected_qty}
                            onChange={(e) => {
                              const parsed = parseInt(e.target.value, 10);
                              set_selected_qty(
                                isNaN(parsed) ? 1 : Math.max(1, Math.min(99, parsed)),
                              );
                            }}
                          />
                        </div>
                        <Button type="button" size="sm" onClick={add_to_cart}>
                          <Plus className="mr-1 h-3 w-3" />
                          {t("ajouter")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart items list */}
                {cart_items.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium">
                      {t("panier")} ({cart_items.length}{" "}
                      {t(cart_items.length > 1 ? "articles" : "article")})
                    </p>
                    <div className="divide-y rounded-md border">
                      {cart_items.map((item) => (
                        <div
                          key={item.sku_id}
                          className="flex items-center justify-between px-3 py-2 text-sm"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {item.sku_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                            <span className="w-24 text-right font-mono text-xs tabular-nums">
                              {(item.unit_price * item.quantity).toLocaleString("fr-DZ")} DZD
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => remove_from_cart(item.sku_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t px-3 py-2 text-sm font-medium">
                        <span>{t("sous_total")}</span>
                        <span className="font-mono tabular-nums">
                          {cart_subtotal.toLocaleString("fr-DZ")} DZD
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("client")} / {t("adresse_livraison")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <Controller
                  name="user_id"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!formState.errors.user_id}>
                      <FieldLabel>{t("select_client")}</FieldLabel>
                      <CustomerCombobox
                        value={field.value || null}
                        onValueChange={(val) => {
                          field.onChange(val ?? "");
                        }}
                        placeholder={t("choose_client")}
                      />
                      {(selected_customer_name || profile_data?.profile) && (
                        <FieldDescription>
                          {selected_customer_name ||
                            [profile_data?.profile?.first_name, profile_data?.profile?.last_name]
                              .filter(Boolean)
                              .join(" ")}
                        </FieldDescription>
                      )}
                      {formState.errors.user_id && (
                        <FieldError errors={[formState.errors.user_id]} />
                      )}
                    </Field>
                  )}
                />
                
                {selected_user_id && (
                  <Field>
                    <FieldLabel>{t("saved_address")}</FieldLabel>
                    <RadioGroupPrimitive.Root
                      value={selected_address_id}
                      onValueChange={(val) => {
                        set_selected_address_id(val);
                        const profile_name =
                          selected_customer_name ||
                          [profile_data?.profile?.first_name, profile_data?.profile?.last_name]
                            .filter(Boolean)
                            .join(" ");
                        if (val === "__new__") {
                          form.setValue("shipping_full_name", profile_name);
                          form.setValue("shipping_phone", "");
                          form.setValue("shipping_line1", "");
                          form.setValue("shipping_line2", "");
                          form.setValue("shipping_city", "");
                          form.setValue("shipping_state", "");
                          form.setValue("shipping_postal_code", "");
                        } else {
                          const addr = profile_data?.addresses?.find((a) => a.id === val);
                          if (addr) {
                            const addr_name = [addr.first_name, addr.last_name]
                              .filter(Boolean)
                              .join(" ");
                            form.setValue("shipping_full_name", addr_name || profile_name);
                            form.setValue("shipping_phone", addr.phone ?? "");
                            form.setValue("shipping_line1", addr.address_line_1 ?? "");
                            form.setValue("shipping_line2", addr.address_line_2 ?? "");
                            form.setValue("shipping_city", addr.city ?? "");
                            form.setValue("shipping_state", addr.state ?? "");
                            form.setValue("shipping_postal_code", addr.postal_code ?? "");
                          }
                        }
                      }}
                      className="space-y-3"
                    >
                      <label
                        className={cn(
                          "hover:bg-primary/50 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
                          selected_address_id === "__new__" &&
                            "border-primary bg-primary/60 text-primary-foreground",
                        )}
                      >
                        <RadioGroupPrimitive.Item
                          value="__new__"
                          className="border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
                        >
                          <RadioGroupPrimitive.Indicator>
                            <Check className="text-primary-foreground size-3" />
                          </RadioGroupPrimitive.Indicator>
                        </RadioGroupPrimitive.Item>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{t("new_address_option")}</p>
                          <p className="text-primary-foreground/90 text-xs">
                            {t("new_address_description") ??
                              "Saisir une nouvelle adresse de livraison"}
                          </p>
                        </div>
                      </label>
                      {profile_data?.addresses?.map((addr) => {
                        const addr_name = [addr.first_name, addr.last_name]
                          .filter(Boolean)
                          .join(" ");
                        const label = [addr.label, addr.address_line_1, addr.city]
                          .filter(Boolean)
                          .join(" — ");
                        return (
                          <label
                            key={addr.id}
                            className={cn(
                              "hover:bg-accent/50 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
                              selected_address_id === addr.id && "border-primary bg-accent/30",
                            )}
                          >
                            <RadioGroupPrimitive.Item
                              value={addr.id}
                              className="border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
                            >
                              <RadioGroupPrimitive.Indicator>
                                <Check className="text-primary-foreground size-3" />
                              </RadioGroupPrimitive.Indicator>
                            </RadioGroupPrimitive.Item>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="truncate text-sm font-medium">{label}</p>
                              <p className="text-muted-foreground truncate text-xs">
                                {addr_name && `${addr_name}`}
                                {addr.phone && ` — ${addr.phone}`}
                                {addr.state && ` — ${addr.state}`}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </RadioGroupPrimitive.Root>
                  </Field>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name="shipping_full_name"
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!formState.errors.shipping_full_name}>
                        <FieldLabel>{t("nom_complet")}</FieldLabel>
                        <Input {...field} placeholder={t("shipping_name_placeholder")} />
                        {formState.errors.shipping_full_name && (
                          <FieldError errors={[formState.errors.shipping_full_name]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="shipping_phone"
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!formState.errors.shipping_phone}>
                        <FieldLabel>{t("telephone")}</FieldLabel>
                        <Input {...field} placeholder={t("phone_placeholder")} />
                        {formState.errors.shipping_phone && (
                          <FieldError errors={[formState.errors.shipping_phone]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="shipping_line1"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!formState.errors.shipping_line1}>
                      <FieldLabel>{t("adresse")}</FieldLabel>
                      <Input {...field} placeholder={t("address_placeholder")} />
                      {formState.errors.shipping_line1 && (
                        <FieldError errors={[formState.errors.shipping_line1]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="shipping_line2"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t("complement_adresse")}</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("address_line2_placeholder")}
                      />
                    </Field>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <Controller
                    name="shipping_city"
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={!!formState.errors.shipping_city}>
                        <FieldLabel>{t("ville")}</FieldLabel>
                        <Input {...field} placeholder={t("city_placeholder")} />
                        {formState.errors.shipping_city && (
                          <FieldError errors={[formState.errors.shipping_city]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="shipping_state"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("wilaya_etat")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("state_placeholder")}
                        />
                      </Field>
                    )}
                  />
                  <Controller
                    name="shipping_postal_code"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t("code_postal")}</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder={t("postal_placeholder")}
                        />
                      </Field>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("notes_internes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder={t("notes_placeholder")}
                        rows={3}
                      />
                    </Field>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  set_open(false);
                  reset();
                  set_cart_items([]);
                  set_search_query("");
                  set_selected_address_id("__new__");
                }}
                disabled={is_pending}
              >
                {t("annuler")}
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={is_pending || cart_items.length === 0}
              >
                {is_pending ? t("creating") : t("create_order")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
