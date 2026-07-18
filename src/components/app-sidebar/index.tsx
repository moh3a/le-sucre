"use client";

import {
  FolderTree,
  Building2,
  Package,
  ChevronRight,
  Blend,
  ShieldCog,
  UsersRound,
  ScrollText,
  ReceiptCent,
  TicketPercent,
  ClipboardList,
  ShoppingCart,
  Truck,
  MessageCircleCheck,
  Warehouse,
  TrendingUpDown,
  ChartArea,
  Gauge,
  FileText,
  Megaphone,
  Cog,
  Handshake,
  Ban,
  ListTodo,
  CreditCard,
  Flag,
  HeartPulse,
  Image as ImageIcon,
  ExternalLink,
  Clock,
  Route,
  Shield,
  GitBranch,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth/client";
import { TooltipProvider } from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";

function SidebarSkeleton() {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <Skeleton className="h-5 w-24" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton className="h-3 w-20" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Skeleton className="h-8 w-full" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Skeleton className="h-8 w-full" />
            </SidebarMenuItem>
            {Array.from({ length: 6 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <Skeleton className="h-8 w-full" />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Skeleton className="h-8 w-full" />
        <div className="flex items-center gap-2 px-2">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar() {
  const { data, isPending, error } = authClient.useSession();
  const { state } = useSidebar();
  const is_collapsed = state === "collapsed";

  const pathname = usePathname();
  const t = useTranslations("nav");

  const nav = [
    {
      title: t("catalog"),
      icon: Package,
      items: [
        { title: t("products"), url: "/console/products", icon: Package },
        { title: t("categories"), url: "/console/categories", icon: FolderTree },
        { title: t("brands"), url: "/console/brands", icon: Building2 },
        { title: t("variants"), url: "/console/variants", icon: Blend },
        { title: t("reviews"), url: "/console/reviews", icon: MessageCircleCheck },
        { title: t("media_library"), url: "/console/media", icon: ImageIcon },
      ],
    },
    {
      title: t("orders"),
      icon: ReceiptCent,
      items: [
        { title: t("orders"), url: "/console/orders", icon: ReceiptCent },
        { title: t("shipments") /* t("deliveries")*/, url: "/console/shipping", icon: Truck },
        { title: t("preorders"), url: "/console/preorders", icon: ClipboardList },
        { title: t("carts"), url: "/console/carts", icon: ShoppingCart },
        { title: t("customers"), url: "/console/customers", icon: Handshake },
      ],
    },
    {
      title: t("payments"),
      icon: CreditCard,
      items: [
        { title: t("payments"), url: "/console/payments", icon: CreditCard },
        { title: t("invoices"), url: "/console/invoices", icon: FileText },
      ],
    },
    {
      title: t("marketing"),
      icon: Megaphone,
      items: [
        { title: t("promotions"), url: "/console/promotions", icon: TicketPercent },
        { title: t("campaigns"), url: "/console/campaigns", icon: Megaphone },
      ],
    },
    {
      title: t("stock"),
      icon: Warehouse,
      items: [
        { title: t("inventory"), url: "/console/inventory", icon: Warehouse },
        {
          title: t("approvisionnement"),
          url: "/console/procurement",
          icon: Truck,
          activeExact: false,
        },
        { title: t("returns_rma"), url: "/console/returns", icon: RotateCcw, activeExact: false },
      ],
    },
    {
      title: t("operations"),
      icon: Gauge,
      items: [
        { title: t("dashboard"), url: "/console/operations", icon: Gauge },
        { title: t("sla_definitions"), url: "/console/operations/sla-definitions", icon: Clock },
        { title: t("routing_rules"), url: "/console/operations/routing-rules", icon: Route },
        {
          title: t("approval_workflows"),
          url: "/console/operations/approval-workflows",
          icon: GitBranch,
        },
        { title: t("fraud_reviews"), url: "/console/operations/fraud-reviews", icon: Shield },
        { title: t("agent_kpi"), url: "/console/operations/agent-kpi", icon: TrendingUpDown },
      ],
    },
    {
      title: t("administration"),
      icon: ShieldCog,
      items: [
        { title: t("users"), url: "/console/users", icon: UsersRound },
        { title: t("authorizations"), url: "/console/authorization", icon: ShieldCog },
        { title: t("audit"), url: "/console/audit-logs", icon: ScrollText },
        { title: t("feature_flags"), url: "/console/feature-flags", icon: Flag },
        { title: t("ip_blacklist"), url: "/console/blacklist", icon: Ban },
        { title: t("health"), url: "/console/health", icon: HeartPulse },
      ],
    },
  ];

  if (error) {
    return (
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <h2 className="font-heading px-2 text-lg font-semibold">{t("le_sucre", { appName: APP_NAME })}</h2>
        </SidebarHeader>
        <SidebarContent>
          <p className="text-destructive px-4 text-sm">Failed to load session.</p>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (isPending) {
    return (
      <TooltipProvider>
        <SidebarSkeleton />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <h2 className="font-heading px-2 text-lg font-semibold">{t("le_sucre", { appName: APP_NAME })}</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
            <SidebarMenu>
              <Link href="/console">
                <SidebarMenuButton tooltip={t("dashboard")} isActive={pathname === "/console"}>
                  <Gauge className="size-4" />
                  <span>{t("dashboard")}</span>
                </SidebarMenuButton>
              </Link>
              <Link href="/console/analytics">
                <SidebarMenuButton
                  tooltip={t("analytics")}
                  isActive={pathname.startsWith("/console/analytics")}
                >
                  <ChartArea className="size-4" />
                  <span>{t("analytics")}</span>
                </SidebarMenuButton>
              </Link>
              <Link href="/console/tasks">
                <SidebarMenuButton
                  tooltip={t("tasks")}
                  isActive={pathname.startsWith("/console/tasks")}
                >
                  <ListTodo className="size-4" />
                  <span>{t("tasks")}</span>
                </SidebarMenuButton>
              </Link>
              {nav.map(({ icon: Icon, ...section }) =>
                is_collapsed ? (
                  <SidebarMenuItem key={section.title}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton tooltip={section.title}>
                          <Icon />
                          <span>{section.title}</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="min-w-48">
                        {section.items.map((item) => (
                          <DropdownMenuItem key={item.url} asChild>
                            <Link
                              href={item.url}
                              className={cn(
                                "flex items-center gap-2",
                                pathname.startsWith(item.url) && "font-medium",
                              )}
                            >
                              <item.icon className="size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ) : (
                  <Collapsible key={section.title} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={section.title}>
                          <Icon />
                          <span>{section.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname.startsWith(item.url)}
                              >
                                <Link href={item.url}>
                                  <item.icon className="size-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ),
              )}
              <Link href="/console/settings">
                <SidebarMenuButton
                  tooltip={t("settings")}
                  isActive={pathname.startsWith("/console/settings")}
                >
                  <Cog className="size-4" />
                  <span>{t("settings")}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Link href="/">
            <SidebarMenuButton
              tooltip="Website"
              className="bg-primary text-primary-foreground hover:bg-primary/75"
            >
              <ExternalLink className="size-4" />
              <span>Visit website</span>
            </SidebarMenuButton>
          </Link>
          <NavUser
            user={{
              name: data?.user.name ?? "",
              email: data?.user.email ?? "",
              avatar: data?.user.image ?? "",
              role: data?.userRole ?? null,
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
