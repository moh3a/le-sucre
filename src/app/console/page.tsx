import { APP_NAME } from "@/constants";
import { DashboardPageClient } from "@/features/console_dashboard/components/dashboard-page-client";

export const metadata = { title: "Tableau de bord" };

export default function Home() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-4xl font-bold">Hello. Welcome to {APP_NAME}.</h1>
        <p className="text-lg">Your one-stop shop for all your sweet treats.</p>
      </div>
      <DashboardPageClient />
    </>
  );
}
