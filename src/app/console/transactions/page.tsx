import { redirect } from "next/navigation";

export const metadata = { title: "Transactions" };

export default function TransactionsPage() {
  redirect("/console/payments");
}
