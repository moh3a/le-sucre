import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";

// French metadata; optional issue_csrf_token() for forms.
export const metadata: Metadata = {
  title: "Le Sucré",
  description: "Your eCommerce platform.",
};

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth?next=/console");

  try {
    await new AuthorizationService().assert_admin_console(session.user.id);
  } catch {
    redirect("/auth?error=forbidden");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
