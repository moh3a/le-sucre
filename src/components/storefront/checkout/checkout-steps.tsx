import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CheckoutStep {
  key: string;
  label: string;
}

interface CheckoutStepsProps {
  steps: CheckoutStep[];
  currentIndex: number;
  completedIcon?: string;
}

export function CheckoutSteps({
  steps,
  currentIndex,
  completedIcon = "✓",
}: CheckoutStepsProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : i < currentIndex
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < currentIndex ? completedIcon : i + 1}
          </div>
          <span
            className={cn(
              "text-sm",
              i === currentIndex ? "font-medium" : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && <Separator className="w-8" />}
        </div>
      ))}
    </div>
  );
}
