"use client";

import {
  BarChart3,
  Box,
  ChevronLeft,
  ClipboardList,
  Grid3X3,
  Home,
  LayoutDashboard,
  Package,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants";

const navItems = [
  { href: "/console", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/console/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/console/products", label: "Produits", icon: Box },
  { href: "/console/categories", label: "Catégories", icon: Grid3X3 },
  { href: "/console/customers", label: "Clients", icon: Users },
  { href: "/console/inventory", label: "Inventaire", icon: Package },
  { href: "/console/promotions", label: "Promotions", icon: Tag },
  { href: "/console/analytics", label: "Analytiques", icon: BarChart3 },
  { href: "/console/authorization", label: "Rôles", icon: Shield },
  { href: "/console/audit-logs", label: "Journal d'audit", icon: ClipboardList },
];

const bottomItems = [
  { href: "/", label: "Voir la boutique", icon: Home },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "bg-brand-olive-leaf text-brand-lemon-chiffon relative flex h-screen flex-col border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "border-brand-lemon-chiffon/10 flex h-16 items-center border-b px-4",
            collapsed && "justify-center",
          )}
        >
          {!collapsed && (
            <span className="font-heading text-brand-lemon-lime truncate text-lg font-bold">
              {siteConfig.name}
            </span>
          )}
          {collapsed && (
            <span className="font-heading text-brand-lemon-lime text-lg font-bold">E</span>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "bg-background text-foreground hover:bg-muted absolute top-20 -right-3 z-10 h-6 w-6 rounded-full border shadow-md",
          )}
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </Button>

        {/* Main nav */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-lemon-lime text-brand-olive-leaf"
                      : "text-brand-lemon-chiffon/80 hover:bg-brand-lemon-chiffon/10 hover:text-brand-lemon-chiffon",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{linkContent}</div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom nav */}
        <div className="border-brand-lemon-chiffon/10 border-t py-4">
          <nav className="flex flex-col gap-1 px-2">
            <Separator className="bg-brand-lemon-chiffon/10 mb-2" />
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "text-brand-lemon-chiffon/60 hover:bg-brand-lemon-chiffon/10 hover:text-brand-lemon-chiffon flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{linkContent}</div>
              );
            })}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  );
}
