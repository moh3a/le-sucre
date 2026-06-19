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
  Banknote,
  Warehouse,
  TrendingUpDown,
  ChartArea,
  Gauge,
  FileText,
  Megaphone,
  CalendarClock,
  Cog,
  TriangleAlert,
  Handshake,
  Ban,
  RefreshCw,
  Wrench,
  ListTodo,
  Phone,
  HeadphonesIcon,
  CreditCard,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
import { trpc } from "../providers/app-providers";

export function AppSidebar() {
  // TODO add role to auth client data
  const { data } = authClient.useSession();
  const { data: me } = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(data?.user),
  }); 
  const primary_role = me?.roles?.[0];
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
        { title: "Marques", url: "/console/brands", icon: Building2 },
        { title: "Variantes", url: "/console/variants", icon: Blend },
        { title: "Avis", url: "/console/reviews", icon: MessageCircleCheck },
      ],
    },
    {
      title: "Commandes",
      icon: ReceiptCent,
      items: [
        { title: "Commandes", url: "/console/orders", icon: ReceiptCent },
        { title: "Précommandes", url: "/console/preorders", icon: ClipboardList },
        { title: "Paniers", url: "/console/carts", icon: ShoppingCart },
        { title: "Clients", url: "/console/customers", icon: Handshake },
      ],
    },
    {
      title: "Expéditions",
      icon: Truck,
      items: [
        { title: "Livraisons", url: "/console/shipping", icon: Truck },
      ],
    },
    {
      title: "Paiements & Factures",
      icon: CreditCard,
      items: [
        { title: "Paiements", url: "/console/payments", icon: CreditCard },
        { title: "Factures", url: "/console/invoices", icon: FileText },
        { title: "Remboursements", url: "/console/refunds", icon: RefreshCw },
        { title: "Paiements fournisseurs", url: "/console/payouts", icon: Wallet },
      ],
    },
    {
      title: "Marketing",
      icon: Megaphone,
      items: [
        { title: "Promotions", url: "/console/promotions", icon: TicketPercent },
        { title: "Campagnes", url: "/console/campaigns", icon: Megaphone },
      ],
    },
    {
      title: "Stock",
      icon: Warehouse,
      items: [
        { title: "Inventaire", url: "/console/inventory", icon: Warehouse },
        { title: "Alertes", url: "/console/inventory/alerts", icon: TriangleAlert },
        { title: "Prévisions", url: "/console/inventory/forecast", icon: TrendingUpDown },
      ],
    },
    {
      title: "Opérations",
      icon: Gauge,
      items: [
        { title: "Dashboard", url: "/console/operations", icon: Gauge },
        { title: "Livraisons", url: "/console/operations/delivery", icon: Truck },
        { title: "Remboursements", url: "/console/operations/refunds", icon: RefreshCw },
        { title: "Annulations", url: "/console/operations/cancellations", icon: Ban },
        { title: "Vérifications", url: "/console/operations/payment-verifications", icon: Banknote },
        { title: "Garanties", url: "/console/operations/warranty", icon: Wrench },
        { title: "Validations promo", url: "/console/operations/promotion-reviews", icon: TicketPercent },
        { title: "Tâches", url: "/console/operations/tasks", icon: ListTodo },
        { title: "Relances", url: "/console/operations/follow-ups", icon: Phone },
        { title: "Support", url: "/console/operations/support-cases", icon: HeadphonesIcon },
        { title: "Ajust. stock", url: "/console/operations/inventory-adjustments", icon: Warehouse },
        { title: "Publications", url: "/console/operations/publishing-schedules", icon: CalendarClock },
        { title: "Escalades", url: "/console/operations/escalations", icon: TriangleAlert },
      ],
    },
    {
      title: "Administration",
      icon: ShieldCog,
      items: [
        { title: "Utilisateurs", url: "/console/users", icon: UsersRound },
        { title: "Autorisations", url: "/console/authorization", icon: ShieldCog },
        { title: "Audit", url: "/console/audit-logs", icon: ScrollText },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <h2 className="font-heading px-2 text-lg font-semibold">Le Sucré</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <Link href="/console">
                <SidebarMenuButton tooltip="Tableau de bord" isActive={pathname === "/console"}>
                  <Gauge className="size-4" />
                  <span>Tableau de bord</span>
                </SidebarMenuButton>
              </Link>
              <Link href="/console/analytics">
                <SidebarMenuButton
                  tooltip="Analytics"
                  isActive={pathname.startsWith("/console/analytics")}
                >
                  <ChartArea className="size-4" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </Link>
              {nav.map(({ icon: Icon, ...section }) => (
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
                              <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.url)}>
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
                )
              ))}
              <Link href="/console/settings">
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={pathname.startsWith("/console/settings")}
                >
                  <Cog className="size-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: data?.user.name ?? "",
              email: data?.user.email ?? "",
              avatar: data?.user.image ?? "",
              role: primary_role ?? null
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
