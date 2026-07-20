"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type BreadcrumbEntry = {
  label: string;
  href?: string;
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\/[a-z][a-z0-9]{20,}(?=\/|$)/g, "/[id]");
}

const BREADCRUMB_MAP: Record<string, Array<{ key: string; href?: string }>> = {
  "/console/analytics": [
    { key: "admin_home", href: "/console" },
    { key: "analytics" },
  ],
  "/console/tasks": [
    { key: "admin_home", href: "/console" },
    { key: "tasks" },
  ],
  "/console/settings": [
    { key: "admin_home", href: "/console" },
    { key: "settings" },
  ],
  "/console/account": [
    { key: "admin_home", href: "/console" },
    { key: "account" },
  ],
  "/console/notifications": [
    { key: "admin_home", href: "/console" },
    { key: "notifications" },
  ],

  "/console/products": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "products" },
  ],
  "/console/products/new": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "products", href: "/console/products" },
    { key: "new" },
  ],
  "/console/products/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "products", href: "/console/products" },
    { key: "detail" },
  ],
  "/console/categories": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "categories" },
  ],
  "/console/categories/new": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "categories", href: "/console/categories" },
    { key: "new" },
  ],
  "/console/brands": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "brands" },
  ],
  "/console/variants": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "variants" },
  ],
  "/console/reviews": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "reviews" },
  ],
  "/console/media": [
    { key: "admin_home", href: "/console" },
    { key: "catalog" },
    { key: "media" },
  ],

  "/console/orders": [
    { key: "admin_home", href: "/console" },
    { key: "orders" },
  ],
  "/console/orders/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "orders", href: "/console/orders" },
    { key: "detail" },
  ],
  "/console/shipping": [
    { key: "admin_home", href: "/console" },
    { key: "shipments" },
  ],
  "/console/shipping/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "shipments", href: "/console/shipping" },
    { key: "detail" },
  ],
  "/console/preorders": [
    { key: "admin_home", href: "/console" },
    { key: "preorders" },
  ],
  "/console/carts": [
    { key: "admin_home", href: "/console" },
    { key: "carts" },
  ],
  "/console/customers": [
    { key: "admin_home", href: "/console" },
    { key: "customers" },
  ],
  "/console/customers/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "customers", href: "/console/customers" },
    { key: "detail" },
  ],

  "/console/payments": [
    { key: "admin_home", href: "/console" },
    { key: "payments" },
  ],
  "/console/payments/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "payments", href: "/console/payments" },
    { key: "detail" },
  ],
  "/console/invoices": [
    { key: "admin_home", href: "/console" },
    { key: "invoices" },
  ],
  "/console/invoices/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "invoices", href: "/console/invoices" },
    { key: "detail" },
  ],

  "/console/promotions": [
    { key: "admin_home", href: "/console" },
    { key: "promotions" },
  ],
  "/console/promotions/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "promotions", href: "/console/promotions" },
    { key: "detail" },
  ],
  "/console/campaigns": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns" },
  ],
  "/console/campaigns/new": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "new" },
  ],
  "/console/campaigns/[id]": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "detail" },
  ],
  "/console/campaigns/[id]/analytics": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "analytics" },
  ],
  "/console/campaigns/ab-testing": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "ab_testing" },
  ],
  "/console/campaigns/automation-rules": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "automation_rules" },
  ],
  "/console/campaigns/flash-sales": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "flash_sales" },
  ],
  "/console/campaigns/landing-pages": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "landing_pages" },
  ],
  "/console/campaigns/recommendations": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "recommendations" },
  ],
  "/console/campaigns/scheduler": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "scheduler" },
  ],
  "/console/campaigns/webhooks": [
    { key: "admin_home", href: "/console" },
    { key: "campaigns", href: "/console/campaigns" },
    { key: "webhooks" },
  ],

  "/console/inventory": [
    { key: "admin_home", href: "/console" },
    { key: "inventory" },
  ],
  "/console/procurement": [
    { key: "admin_home", href: "/console" },
    { key: "procurement" },
  ],
  "/console/returns": [
    { key: "admin_home", href: "/console" },
    { key: "returns_rma" },
  ],

  "/console/operations": [
    { key: "admin_home", href: "/console" },
    { key: "operations" },
  ],
  "/console/operations/sla-definitions": [
    { key: "admin_home", href: "/console" },
    { key: "operations", href: "/console/operations" },
    { key: "sla_definitions" },
  ],
  "/console/operations/routing-rules": [
    { key: "admin_home", href: "/console" },
    { key: "operations", href: "/console/operations" },
    { key: "routing_rules" },
  ],
  "/console/operations/approval-workflows": [
    { key: "admin_home", href: "/console" },
    { key: "operations", href: "/console/operations" },
    { key: "approval_workflows" },
  ],
  "/console/operations/fraud-reviews": [
    { key: "admin_home", href: "/console" },
    { key: "operations", href: "/console/operations" },
    { key: "fraud_reviews" },
  ],
  "/console/operations/agent-kpi": [
    { key: "admin_home", href: "/console" },
    { key: "operations", href: "/console/operations" },
    { key: "agent_kpi" },
  ],

  "/console/users": [
    { key: "admin_home", href: "/console" },
    { key: "users" },
  ],
  "/console/authorization": [
    { key: "admin_home", href: "/console" },
    { key: "authorizations" },
  ],
  "/console/audit-logs": [
    { key: "admin_home", href: "/console" },
    { key: "audit" },
  ],
  "/console/feature-flags": [
    { key: "admin_home", href: "/console" },
    { key: "feature_flags" },
  ],
  "/console/blacklist": [
    { key: "admin_home", href: "/console" },
    { key: "blacklist" },
  ],
  "/console/health": [
    { key: "admin_home", href: "/console" },
    { key: "health" },
  ],
};

export function ConsoleBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");

  const normalized = normalizePath(pathname);
  const config = BREADCRUMB_MAP[normalized];

  if (!config || config.length <= 1) return null;

  const items: BreadcrumbEntry[] = config.map((item) => ({
    label: t(item.key),
    href: item.href,
  }));

  return (
    <nav className="text-muted-foreground flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3 shrink-0" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
