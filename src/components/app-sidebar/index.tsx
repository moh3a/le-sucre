"use client";

import {
  FolderTree,
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

export function AppSidebar() {
  const { data } = authClient.useSession();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const catalog_items = [
    { title: t("categories"), url: "/console/categories", icon: FolderTree },
    { title: t("products"), url: "/console/products", icon: Package },
    { title: "Variantes", url: "/console/variants", icon: Blend },
  ];

  const order_items = [
    { title: "Commandes", url: "/console/orders", icon: ReceiptCent },
    { title: "Promotions", url: "/console/promotions", icon: TicketPercent },
    { title: "Précommandes", url: "/console/preorders", icon: ClipboardList },
    { title: "Paniers", url: "/console/carts", icon: ShoppingCart },
    { title: "Livraisons", url: "/console/shipping", icon: Truck },
  ];

  // TODO copypaste ssadmin sidebar
  // TODO add inventory, reviews, analytics

  const user_items = [
    { title: "Utilisateurs", url: "/console/users", icon: UsersRound },
    { title: "Autorizations", url: "/console/authorization", icon: ShieldCog },
    { title: "Audit", url: "/console/audit-logs", icon: ScrollText },
  ];

  return (
    <TooltipProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <h2 className="font-heading px-2 text-lg font-semibold">Le Sucré</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("catalog")}</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={t("catalog")}>
                      <Package />
                      <span>{t("catalog")}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {catalog_items.map((item) => (
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
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="eCommerce">
                      <KeyRound />
                      <span>eCommerce</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {order_items.map((item) => (
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
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Auth">
                      <KeyRound />
                      <span>Auth</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {user_items.map((item) => (
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
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: data?.user.name ?? "",
              email: data?.user.email ?? "",
              avatar: data?.user.image ?? "",
            }}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
