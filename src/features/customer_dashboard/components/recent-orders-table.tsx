import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface OrderRow {
  id: string;
  date: string;
  statusKey: string;
  total: string;
}

interface RecentOrdersTableProps {
  title: string;
  description: string;
  orders: OrderRow[];
  statusLabel: (key: string) => string;
  statusVariant?: (key: string) => "default" | "secondary" | "outline" | "destructive";
  viewAllLabel: string;
  viewAllHref: string;
  columnLabels: {
    order: string;
    date: string;
    status: string;
    total: string;
  };
}

function defaultStatusVariant(key: string) {
  if (key === "status_delivered") return "secondary" as const;
  if (key === "status_shipped") return "default" as const;
  return "outline" as const;
}

export function RecentOrdersTable({
  title,
  description,
  orders,
  statusLabel,
  statusVariant = defaultStatusVariant,
  viewAllLabel,
  viewAllHref,
  columnLabels,
}: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pb-2 font-medium pr-4">{columnLabels.order}</th>
                <th className="pb-2 font-medium pr-4">{columnLabels.date}</th>
                <th className="pb-2 font-medium pr-4">{columnLabels.status}</th>
                <th className="pb-2 text-right font-medium">{columnLabels.total}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <Link
                      href={`${viewAllHref}/${order.id}`}
                      className="text-primary hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{order.date}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant(order.statusKey)}>
                      {statusLabel(order.statusKey)}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
