import { CustomerSupportTicketForm } from "@/features/operations_workflows/components/customer-order-tracking";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Customer Support</h1>
      <CustomerSupportTicketForm />
    </div>
  );
}
