"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Download,
  FileText,
  RefreshCcw,
  XCircle,
  CreditCard,
  User,
  MapPin,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";
import { InvoiceExtrasDialog } from "./invoice-extras-dialog";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  unpaid: "outline",
  void: "destructive",
  refunded: "secondary",
  partially_refunded: "secondary",
};

type InvoiceItem = {
  id: string;
  sku_code: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
};

type BillingAddress = {
  full_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
};

type Invoice = {
  id: string;
  order_id: string;
  invoice_number: string;
  type: string;
  status: string;
  currency: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  shipping_total: string;
  grand_total: string;
  billing_address: BillingAddress;
  shipping_address: BillingAddress;
  vat_number?: string | null;
  due_at?: string | null;
  paid_at?: string | null;
  created_at: string;
  items: InvoiceItem[];
  customer_name?: string | null;
  customer_email?: string | null;
  order_number?: string | null;
};

export function InvoiceDetailClient({ id }: { id: string }) {
  const t = useTranslations("invoices");
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const STATUS_LABEL: Record<string, string> = {
    paid: t("status_paid"),
    unpaid: t("status_unpaid"),
    void: t("status_void"),
    refunded: t("status_refunded"),
    partially_refunded: t("status_partially_refunded"),
  };

  const TYPE_LABEL: Record<string, string> = {
    order_invoice: t("type_order_invoice"),
    refund_invoice: t("type_refund_invoice"),
    credit_note: t("type_credit_note"),
  };

  const { data, isLoading, error } = trpc.invoices.get_invoice.useQuery({ id });
  const mark_paid_mutation = trpc.invoices.mark_as_paid.useMutation({
    onSuccess: () => {
      toast.success(t("mark_paid"));
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });
  const void_mutation = trpc.invoices.void_invoice.useMutation({
    onSuccess: () => {
      toast.success(t("void"));
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const invoice = data as Invoice | undefined;

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/download`);
      if (!res.ok) throw new Error(t("download_failed"));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("download_error"));
    } finally {
      setDownloading(false);
    }
  };

  if (!invoice) return null;

  const billing = invoice.billing_address as BillingAddress;
  const shipping = invoice.shipping_address as BillingAddress;

  const fmt = (n: string | number) =>
    Number(n).toLocaleString("fr-FR", {
      style: "currency",
      currency: invoice.currency || "DZD",
      maximumFractionDigits: 2,
    });

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-muted-foreground size-5" />
          <div>
            <h3 className="font-mono text-lg font-bold">{invoice.invoice_number}</h3>
            <p className="text-muted-foreground text-sm">
              {TYPE_LABEL[invoice.type] ?? invoice.type} ·{" "}
              {formatDate(invoice.created_at, { month: "long" })}
            </p>
            {t("loading")}
          </div>
          <Badge variant={STATUS_BADGE[invoice.status] ?? "outline"}>
            {STATUS_LABEL[invoice.status] ?? invoice.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "unpaid" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => mark_paid_mutation.mutate({ id })}
              disabled={mark_paid_mutation.isPending}
            >
              <CheckCircle2 className="mr-2 size-4" />
              {t("mark_paid")}
            </Button>
          )}
          {invoice.status !== "void" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive">
                  <XCircle className="mr-2 size-4" />
                  {t("void")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("void_confirm_title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("void_confirm_description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>                  {t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void_mutation.mutate({ id })}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {t("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <InvoiceExtrasDialog
            invoice={{ id, order_id: invoice.order_id }}
            trigger={
              <Button size="sm" variant="outline">
                <MoreHorizontal className="mr-2 size-4" />
                Actions
              </Button>
            }
          />
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            <Download className="mr-2 size-4" />
            {downloading ? t("loading") : t("download_pdf")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Package className="size-4" />
                {t("items")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-left text-xs">
                      <th className="pb-2 pr-4 font-medium">{t("reference")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("product")}</th>
                      <th className="pb-2 pr-4 text-right font-medium">{t("qty")}</th>
                      <th className="pb-2 pr-4 text-right font-medium">{t("unit_price")}</th>
                      <th className="pb-2 pr-4 text-right font-medium">{t("vat")}</th>
                      <th className="pb-2 text-right font-medium">{t("total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 font-mono text-xs">{item.sku_code}</td>
                        <td className="py-2.5 pr-4">{item.product_name}</td>
                        <td className="py-2.5 pr-4 text-right">{item.quantity}</td>
                        <td className="py-2.5 pr-4 text-right">{fmt(item.unit_price)}</td>
                        <td className="py-2.5 pr-4 text-right">
                          {(Number(item.tax_rate) * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 text-right font-medium">{fmt(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t pt-4">
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>{t("subtotal")}</span>
                  <span>{fmt(invoice.subtotal)}</span>
                </div>
                {Number(invoice.discount_total) > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>{t("discount")}</span>
                    <span>-{fmt(invoice.discount_total)}</span>
                  </div>
                )}
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>{t("vat")}</span>
                  <span>{fmt(invoice.tax_total)}</span>
                </div>
                {Number(invoice.shipping_total) > 0 && (
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>{t("shipping_fee")}</span>
                    <span>{fmt(invoice.shipping_total)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{t("total_ttc")}</span>
                  <span className="text-lg">{fmt(invoice.grand_total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <User className="size-4" />
                {t("client")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{invoice.customer_name ?? billing.full_name ?? "—"}</p>
              {invoice.customer_email && (
                <p className="text-muted-foreground">{invoice.customer_email}</p>
              )}
              {invoice.vat_number && (
                <p className="text-muted-foreground">NIF: {invoice.vat_number}</p>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4" />
                {t("billing_address")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-0.5 text-sm">
              <p>{billing.full_name}</p>
              <p>{billing.address}</p>
              <p>
                {billing.zip_code} {billing.city}
              </p>
              <p>{billing.state}</p>
              {billing.phone && <p>{billing.phone}</p>}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="size-4" />
                {t("shipping_address")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-0.5 text-sm">
              <p>{shipping.full_name}</p>
              <p>{shipping.address}</p>
              <p>
                {shipping.zip_code} {shipping.city}
              </p>
              <p>{shipping.state}</p>
              {shipping.phone && <p>{shipping.phone}</p>}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <RefreshCcw className="size-4" />
                {t("dates")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("issue_date")}</span>
                <span>{formatDate(invoice.created_at, { month: "short" })}</span>
              </div>
              {invoice.due_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("due_date")}</span>
                  <span>{formatDate(invoice.due_at, { month: "short" })}</span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("paid_on")}</span>
                  <span className="text-green-600">{formatDate(invoice.paid_at, { month: "short" })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </QueryGuard>
  );
}
