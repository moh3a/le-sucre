import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ConsoleBreadcrumb } from "@/components/console/console-breadcrumb";
import { auth } from "@/lib/auth";
import { AuthorizationService } from "@/features/authentication_and_authorization/authorization/services/authorization.service";
import { InitService } from "@/features/init_system/services/init.service";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Votre plateforme e-commerce de confiance.",
};

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { initialized } = await new InitService().check_status();
  if (!initialized) redirect("/init");

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
          <div className="flex items-center gap-2 px-6 pt-4 pb-2">
            <SidebarTrigger />
            <ConsoleBreadcrumb />
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
