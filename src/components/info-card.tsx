import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function InfoCard({ icon, title, description, className }: InfoCardProps) {
  return (
    <Card
      className={cn(
        "flex items-center gap-4 bg-linear-to-br p-6",
        "from-lemon-chiffon/30 to-cream/50",
        className,
      )}
    >
      <div className="bg-lemon-lime/30 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Card>
  );
}
