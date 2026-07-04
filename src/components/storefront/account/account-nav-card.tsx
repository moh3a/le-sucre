import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

interface NavCardItem {
  href: string;
  label: string;
  icon: string;
}

interface AccountNavCardProps {
  title: string;
  items: NavCardItem[];
}

export function AccountNavCard({ title, items }: AccountNavCardProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:border-primary cursor-pointer transition-colors h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span aria-hidden="true">{card.icon}</span>
                  <span>{card.label}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
