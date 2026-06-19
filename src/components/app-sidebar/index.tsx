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
  KeyRound,
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
  Cog,
  TriangleAlert,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

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
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

  const pathname = usePathname();
  const t = useTranslations("nav");

  const nav = [
    {
      title: t("catalog"),
      icon: Package,
      items: [
        { title: t("categories"), url: "/console/categories", icon: FolderTree },
        { title: "Marques", url: "/console/brands", icon: Building2 },
        { title: t("products"), url: "/console/products", icon: Package },
        { title: "Variantes", url: "/console/variants", icon: Blend },
        { title: "Avis", url: "/console/reviews", icon: MessageCircleCheck },
      ],
    },
    {
      title: "Stock",
      icon: Warehouse,
      items: [
        { title: "Inventaire", url: "/console/inventory", icon: Warehouse },
        { title: "Alertes", url: "/console/inventory/alerts", icon: TriangleAlert },
        { title: "Forecasting", url: "/console/inventory/forecast", icon: TrendingUpDown },
      ],
    },
    {
      title: "eCommerce",
      icon: Banknote,
      items: [
        { title: "Commandes", url: "/console/orders", icon: ReceiptCent },
        { title: "Clients", url: "/console/customers", icon: Handshake },
        { title: "Factures", url: "/console/invoices", icon: FileText },
        { title: "Promotions", url: "/console/promotions", icon: TicketPercent },
        { title: "Campagnes", url: "/console/campaigns", icon: Megaphone },
        { title: "Précommandes", url: "/console/preorders", icon: ClipboardList },
        { title: "Paniers", url: "/console/carts", icon: ShoppingCart },
        { title: "Livraisons", url: "/console/shipping", icon: Truck },
      ],
    },
    {
      title: "Auth",
      icon: KeyRound,
      items: [
        { title: "Utilisateurs", url: "/console/users", icon: UsersRound },
        { title: "Autorizations", url: "/console/authorization", icon: ShieldCog },
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
              role: primary_role
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
