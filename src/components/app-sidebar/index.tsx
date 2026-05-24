"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { authClient } from "@/lib/auth/client";

export function AppSidebar() {
  const { data } = authClient.useSession();

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <h2>Le Sucré</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
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
  );
}
