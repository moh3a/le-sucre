"use client";

import { FolderTree, Package, ChevronRight } from "lucide-react";
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
  ];

  return (
    <TooltipProvider>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <h2 className="px-2 font-heading text-lg font-semibold">Le Sucré</h2>
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
