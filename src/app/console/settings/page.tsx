import { Suspense } from "react";
import { SettingsPageClient } from "@/features/console_dashboard/components/settings-page-client";

export const metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
