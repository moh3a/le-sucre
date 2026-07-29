"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus, PackageX } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderCombobox } from "@/features/order_management_system/orders/components/order-combobox";
import { QueryGuard } from "@/components/query-guard";

const create_form_schema = z.object({
  order_id: z.string().min(1),
  type: z.enum(["return", "replacement", "failed_delivery"]),
  reason: z.string().min(1).max(2048),
  customer_note: z.string().max(2048).optional(),
});

type CreateFormValues = z.infer<typeof create_form_schema>;

type ItemEntry = {
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: string;
};

export function CreateReturnDialog() {
  const t = useTranslations("return_requests");
  const utils = trpc.useUtils();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<ItemEntry[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(create_form_schema),
    defaultValues: {
      order_id: "",
      type: "return",
      reason: "",
      customer_note: "",
    },
  });

  const order_id = watch("order_id");
  const type = watch("type");

  const { data: orderDetail, isLoading: orderLoading } = trpc.orders.adminGet.useQuery(
    { order_id },
    { enabled: !!order_id },
  );

  React.useEffect(() => {
    if (orderDetail?.items) {
      setItems(
        orderDetail.items.map((item) => ({
          sku_id: item.sku_id,
          product_name: item.product_name,
          sku_code: item.sku_code,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      );
    } else {
      setItems([]);
    }
  }, [orderDetail]);

  const create_mutation = trpc.returns.adminCreate.useMutation({
    onSuccess: () => {
      toast.success(t("request_created"));
      setOpen(false);
      reset();
      setItems([]);
      void utils.returns.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function onSubmit(values: CreateFormValues) {
    const selected_items = items.filter((i) => i.quantity > 0);
    if (selected_items.length === 0) {
      toast.error("Sélectionnez au moins un article");
      return;
    }
    create_mutation.mutate({
      order_id: values.order_id,
      type: values.type,
      reason: values.reason,
      customer_note: values.customer_note || undefined,
      items: selected_items.map((i) => ({
        sku_id: i.sku_id,
        product_name: i.product_name,
        sku_code: i.sku_code,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });
  }

  function updateItemQuantity(sku_id: string, qty: number) {
    setItems((prev) =>
      prev.map((i) => (i.sku_id === sku_id ? { ...i, quantity: Math.max(0, qty) } : i)),
    );
  }

  return (
    <QueryGuard mutation={create_mutation}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            {t("create_trigger")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("create_title")}</DialogTitle>
            <DialogDescription>{t("create_description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("select_order")}</Label>
              <input type="hidden" {...register("order_id")} />
              <OrderCombobox
                value={order_id}
                onValueChange={(v) => setValue("order_id", v ?? "", { shouldValidate: true })}
                disabled={create_mutation.isPending}
              />
              {errors.order_id && (
                <p className="text-xs text-red-500">{errors.order_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("select_type")}</Label>
              <Select
                value={type}
                onValueChange={(v) =>
                  setValue("type", v as "return" | "replacement" | "failed_delivery", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">{t("type_return")}</SelectItem>
                  <SelectItem value="replacement">{t("type_replacement")}</SelectItem>
                  <SelectItem value="failed_delivery">{t("type_failed_delivery")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {order_id && (
              <QueryGuard query={{ isLoading: orderLoading }}>
                {items.length > 0 ? (
                  <div className="space-y-2">
                    <Label>{t("items_column")}</Label>
                    <div className="rounded-md border text-sm">
                      <table className="w-full text-xs">
                        <thead className="border-b text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">
                              {t("product_column")}
                            </th>
                            <th className="px-3 py-2 text-left font-medium">{t("sku_column")}</th>
                            <th className="px-3 py-2 text-right font-medium">
                              {t("qty_column")}
                            </th>
                            <th className="px-3 py-2 text-right font-medium">
                              {t("price_column")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {items.map((item) => (
                            <tr key={item.sku_id}>
                              <td className="px-3 py-2 font-medium">{item.product_name}</td>
                              <td className="px-3 py-2 font-mono">{item.sku_code}</td>
                              <td className="px-3 py-2 text-right">
                                <Input
                                  type="number"
                                  min={0}
                                  max={item.quantity}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItemQuantity(item.sku_id, Number(e.target.value))
                                  }
                                  className="ml-auto h-8 w-20 text-right"
                                  disabled={create_mutation.isPending}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                {Number(item.unit_price).toLocaleString("fr-FR")} DZD
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </QueryGuard>
            )}

            <div className="space-y-2">
              <Label>{t("reason_label")}</Label>
              <Textarea
                {...register("reason")}
                placeholder={t("reason_placeholder")}
                className="min-h-[80px]"
                disabled={create_mutation.isPending}
              />
              {errors.reason && (
                <p className="text-xs text-red-500">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("admin_note_label")}</Label>
              <Textarea
                {...register("customer_note")}
                placeholder={t("note_placeholder")}
                className="min-h-[60px]"
                disabled={create_mutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={create_mutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={create_mutation.isPending}>
                <PackageX />
                {create_mutation.isPending ? t("creating") : t("create_submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </QueryGuard>
  );
}
