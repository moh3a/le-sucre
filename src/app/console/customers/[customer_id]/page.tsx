import { CustomerDetailTabs } from "@/features/order_management_system/customers/components/customer-detail-tabs";

type Props = { params: Promise<{ customer_id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const { customer_id } = await params;

  return (
    <div className="container p-6">
      <CustomerDetailTabs user_id={customer_id} />
    </div>
  );
}
 