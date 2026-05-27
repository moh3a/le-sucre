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
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart, badge: null },
  { href: "/admin/produits", label: "Produits", icon: Box },
  { href: "/admin/categories", label: "Catégories", icon: Grid3X3 },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/inventaire", label: "Inventaire", icon: Package },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/analytiques", label: "Analytiques", icon: BarChart3 },
  { href: "/admin/roles", label: "Rôles", icon: Shield },
  { href: "/admin/audit", label: "Journal d'audit", icon: ClipboardList },
];

const bottomItems = [
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
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
          "relative flex h-screen flex-col border-r bg-brand-olive-leaf text-brand-lemon-chiffon transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-16 items-center border-b border-brand-lemon-chiffon/10 px-4", collapsed && "justify-center")}>
          {!collapsed && (
            <span className="font-heading text-lg font-bold text-brand-lemon-lime truncate">
              {siteConfig.name}
            </span>
          )}
          {collapsed && (
            <span className="font-heading text-lg font-bold text-brand-lemon-lime">E</span>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background text-foreground shadow-md hover:bg-muted",
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
                  {!collapsed && item.badge && (
                    <Badge className="ml-auto bg-brand-crimson-violet text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
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
        <div className="border-t border-brand-lemon-chiffon/10 py-4">
          <nav className="flex flex-col gap-1 px-2">
            <Separator className="mb-2 bg-brand-lemon-chiffon/10" />
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-brand-lemon-chiffon/60 transition-colors hover:bg-brand-lemon-chiffon/10 hover:text-brand-lemon-chiffon",
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
