"use client";

import {
  User,
  Mail,
  ShoppingCart,
  Package,
  Calendar,
  CreditCard,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  RotateCcw,
  Gift,
  MessageSquare,
  Phone,
  StickyNote,
  HeadphonesIcon,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { StatsGrid } from "@/components/console/stats-grid";
import type { StatItem } from "@/components/console/stats-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerContactsTab } from "./customer-contacts-tab";
import { CustomerNotesTab } from "./customer-notes-tab";
import { CustomerSupportTab } from "./customer-support-tab";
import { CustomerFollowupsTab } from "./customer-followups-tab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

type CustomerDetailTabsProps = { user_id: string };

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  merged: "secondary",
  converted: "outline",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  confirmed: "Confirmée",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  failed_delivery: "Livraison échouée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  hidden: "Masqué",
};

const REVIEW_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  hidden: "outline",
};

const RETURN_TYPE_LABELS: Record<string, string> = {
  return: "Retour",
  replacement: "Remplacement",
  failed_delivery: "Livraison échouée",
};

const RETURN_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
  in_transit: "En transit",
  received: "Reçue",
  completed: "Terminée",
  cancelled: "Annulée",
};

const RETURN_STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  in_transit: "outline",
  received: "default",
  completed: "default",
  cancelled: "outline",
};

function CartItemRow({
  item,
}: {
  item: {
    sku_id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
    fulfillment_type: string;
  };
}) {
  return (
    <div className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="max-w-[180px] truncate font-medium">{item.product_id.slice(0, 12)}</span>
        <span className="text-muted-foreground text-xs">SKU: {item.sku_id.slice(0, 12)}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">x{item.quantity}</span>
        <span className="tabular-nums">{Number(item.unit_price).toLocaleString("fr-FR")} DZD</span>
        <Badge variant="outline" className="text-[10px]">
          {item.fulfillment_type}
        </Badge>
      </div>
    </div>
  );
}

function CartCard({
  cart,
}: {
  cart: {
    id: string;
    status: string;
    currency: string;
    created_at: string;
    updated_at: string;
    items: Array<{
      id: string;
      sku_id: string;
      product_id: string;
      quantity: number;
      unit_price: string;
      currency: string;
      fulfillment_type: string;
      created_at: string;
    }>;
  };
}) {
  const [open, setOpen] = useState(false);
  const total = cart.items.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);

  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <CardTitle className="text-sm font-medium">
                  Panier{" "}
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                    {cart.id.slice(0, 16)}…
                  </code>
                </CardTitle>
                <p className="text-muted-foreground text-xs">{formatDate(cart.updated_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={STATUS_BADGE_VARIANTS[cart.status] ?? "outline"}>
                {cart.status === "active"
                  ? "Actif"
                  : cart.status === "converted"
                    ? "Converti"
                    : cart.status === "merged"
                      ? "Fusionné"
                      : cart.status}
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {total.toLocaleString("fr-FR")} {cart.currency}
              </span>
              <Badge variant="outline">
                {cart.items.length} article{cart.items.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="space-y-2 pt-0 pb-4">
          {cart.items.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-sm">Panier vide</p>
          ) : (
            cart.items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </CardContent>
      )}
    </Card>
  );
}

function OrderItemRow({
  item,
}: {
  item: {
    sku_code: string;
    product_name: string;
    quantity: number;
    unit_price: string;
    line_total: string;
    fulfillment_type: string;
  };
}) {
  return (
    <div className="bg-muted/30 flex items-center justify-between rounded-md px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="max-w-[220px] truncate font-medium">{item.product_name}</span>
        <span className="text-muted-foreground text-xs">SKU: {item.sku_code}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">x{item.quantity}</span>
        <span className="text-muted-foreground tabular-nums">
          {Number(item.unit_price).toLocaleString("fr-FR")} DZD
        </span>
        <span className="font-medium tabular-nums">
          {Number(item.line_total).toLocaleString("fr-FR")} DZD
        </span>
      </div>
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    grand_total: string;
    currency: string;
    placed_at: string | null;
    created_at: string;
    shipping_address: Record<string, unknown>;
    items: Array<{
      id: string;
      sku_code: string;
      product_name: string;
      quantity: number;
      unit_price: string;
      line_total: string;
      fulfillment_type: string;
    }>;
  };
}) {
  const [open, setOpen] = useState(false);
  const addr = order.shipping_address as Record<string, string | undefined>;

  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <CardTitle className="text-sm font-medium">
                  Commande <span className="font-mono">{order.order_number}</span>
                  <Link
                    href={`/console/orders/${order.id}`}
                    className="ml-2 inline-flex items-center text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="mr-0.5 h-3 w-3" />
                    Détails
                  </Link>
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  {order.placed_at ? formatDate(order.placed_at) : formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
              <Badge variant="secondary">
                {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {Number(order.grand_total).toLocaleString("fr-FR")} {order.currency}
              </span>
              <Badge variant="outline">
                {order.items.length} article{order.items.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="space-y-3 pt-0 pb-4">
          {order.items.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-sm">Aucun article</p>
          ) : (
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
          {addr.full_name && (
            <div className="bg-muted/30 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
              <MapPin className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="text-muted-foreground">
                {String(addr.full_name)} — {String(addr.line1 ?? "")}, {String(addr.city ?? "")}
                {addr.state ? `, ${String(addr.state)}` : ""}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function ReviewCard({ review }: { review: Record<string, unknown> }) {
  const r = review as { rating: number; status: string; is_verified_purchase: boolean; title?: string; body: string; created_at: string };
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <Badge variant={REVIEW_BADGE_VARIANTS[r.status] ?? "outline"}>
              {REVIEW_STATUS_LABELS[r.status] ?? r.status}
            </Badge>
            {r.is_verified_purchase && (
              <Badge variant="outline" className="text-[10px]">Achat vérifié</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">{formatDate(r.created_at)}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {r.title && <p className="mb-1 text-sm font-medium">{r.title}</p>}
        <p className="text-muted-foreground text-sm">{r.body.slice(0, 300)}{r.body.length > 300 ? "…" : ""}</p>
      </CardContent>
    </Card>
  );
}

function ReturnRequestCard({ request }: { request: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const r = request as {
    id: string; type: string; status: string; reason?: string; customer_note?: string;
    refund_amount?: string | null; created_at: string;
    items?: Array<{ product_name: string; quantity: number }>;
  };
  const items = r.items;

  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <div>
                <CardTitle className="text-sm font-medium">
                  {RETURN_TYPE_LABELS[r.type] ?? r.type}
                  <span className="text-muted-foreground ml-2 font-mono text-xs">
                    #{r.id}
                  </span>
                </CardTitle>
                <p className="text-muted-foreground text-xs">{formatDate(r.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={RETURN_STATUS_BADGE_VARIANTS[r.status] ?? "outline"}>
                {RETURN_STATUS_LABELS[r.status] ?? r.status}
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {r.refund_amount
                  ? `${Number(r.refund_amount).toLocaleString("fr-FR")} DZD`
                  : ""}
              </span>
              <Badge variant="outline">
                {items?.length ?? 0} article{items?.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </button>
      {open && (
        <CardContent className="space-y-2 pt-0 pb-4">
          {r.reason && (
            <p className="text-sm">
              <span className="text-muted-foreground">Motif : </span>
              {r.reason}
            </p>
          )}
          {r.customer_note && (
            <p className="text-muted-foreground text-sm">
              Note : {r.customer_note}
            </p>
          )}
          {items && items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div key={idx} className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 text-sm">
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function PromoRedemptionCard({ redemption }: { redemption: Record<string, unknown> }) {
  const r = redemption as {
    promotion_name?: string; promotion_type?: string; code?: string; discount_amount: string; created_at: string;
  };
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="text-muted-foreground h-4 w-4" />
            <div>
              <CardTitle className="text-sm font-medium">
                {r.promotion_name ?? "Promotion"}
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                {r.code
                  ? <span className="font-mono">{r.code.toUpperCase()}</span>
                  : r.promotion_type}
                <span className="before:mx-1 before:content-['·']" />
                {formatDate(r.created_at)}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium tabular-nums text-green-600">
            -{Number(r.discount_amount).toLocaleString("fr-FR")} DZD
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}

export function CustomerDetailTabs({ user_id }: CustomerDetailTabsProps) {
  const { data, isLoading } = trpc.customers.adminGetFullDetail.useQuery({ user_id });

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="text-muted-foreground mb-4 h-12 w-12" />
        <p className="text-muted-foreground text-lg">Client introuvable</p>
      </div>
    );
  }

  const { customer, carts, orders, reviews, return_requests, promo_redemptions } = data;

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-[88px] rounded-lg" />))}</div></div>}>
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{customer.name ?? "Client"}</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5" />
              {customer.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              customer.segment === "vip"
                ? "default"
                : customer.segment === "repeat"
                  ? "secondary"
                  : "outline"
            }
            className="text-sm"
          >
            {customer.segment === "vip"
              ? "VIP"
              : customer.segment === "repeat"
                ? "Répétitif"
                : "Nouveau"}
          </Badge>
        </div>
      </div>

      <StatsGrid
        items={
          [
            {
              label: "Total commandes",
              value: customer.total_orders,
              icon: ShoppingCart,
            },
            {
              label: "Total dépensé",
              value: `${Number(customer.total_spent).toLocaleString("fr-FR")} DZD`,
              icon: CreditCard,
            },
            {
              label: "Panier moyen",
              value: `${Number(customer.average_order_value).toLocaleString("fr-FR")} DZD`,
              icon: TrendingUp,
            },
            {
              label: "Valeur à vie (LTV)",
              value: `${Number(customer.lifetime_value).toLocaleString("fr-FR")} DZD`,
              icon: Package,
            },
          ] satisfies StatItem[]
        }
      />

      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Inscrit le {formatDate(customer.created_at)}
        </div>
        {customer.last_order_at && (
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Dernière commande le {formatDate(customer.last_order_at)}
          </div>
        )}
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Commandes ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="carts" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Paniers ({carts.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Avis ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Retours ({return_requests.length})
          </TabsTrigger>
          <TabsTrigger value="promos" className="gap-2">
            <Gift className="h-4 w-4" />
            Promos ({promo_redemptions.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Phone className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <HeadphonesIcon className="h-4 w-4" />
            Support
          </TabsTrigger>
          <TabsTrigger value="followups" className="gap-2">
            <Bell className="h-4 w-4" />
            Relances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
              <Package className="mb-2 h-10 w-10" />
              <p>Aucune commande</p>
            </div>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>

        <TabsContent value="carts" className="space-y-3">
          {carts.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
              <ShoppingCart className="mb-2 h-10 w-10" />
              <p>Aucun panier</p>
            </div>
          ) : (
            carts.map((cart) => <CartCard key={cart.id} cart={cart} />)
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
              <MessageSquare className="mb-2 h-10 w-10" />
              <p>Aucun avis</p>
            </div>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id as string} review={review as unknown as Record<string, unknown>} />)
          )}
        </TabsContent>

        <TabsContent value="returns" className="space-y-3">
          {return_requests.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
              <RotateCcw className="mb-2 h-10 w-10" />
              <p>Aucune demande de retour</p>
            </div>
          ) : (
            return_requests.map((req) => (
              <ReturnRequestCard key={req.id as string} request={req as unknown as Record<string, unknown>} />
            ))
          )}
        </TabsContent>

        <TabsContent value="promos" className="space-y-3">
          {promo_redemptions.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
              <Gift className="mb-2 h-10 w-10" />
              <p>Aucune promotion utilisée</p>
            </div>
          ) : (
            promo_redemptions.map((red) => (
              <PromoRedemptionCard key={red.id as string} redemption={red as unknown as Record<string, unknown>} />
            ))
          )}
        </TabsContent>

        <TabsContent value="contacts">
          <CustomerContactsTab user_id={user_id} />
        </TabsContent>

        <TabsContent value="notes">
          <CustomerNotesTab user_id={user_id} />
        </TabsContent>

        <TabsContent value="support">
          <CustomerSupportTab user_id={user_id} />
        </TabsContent>

        <TabsContent value="followups">
          <CustomerFollowupsTab user_id={user_id} />
        </TabsContent>
      </Tabs>
    </div>
    </QueryGuard>
  );
}
