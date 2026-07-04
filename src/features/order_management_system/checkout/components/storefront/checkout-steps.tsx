import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Step {
  key: string;
  label: string;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentIndex: number;
  completedIcon?: string;
}

export function CheckoutSteps({ steps, currentIndex, completedIcon = "✓" }: CheckoutStepsProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
              i === currentIndex && "bg-primary text-primary-foreground",
              i < currentIndex && "bg-primary/20 text-primary",
              i > currentIndex && "bg-muted text-muted-foreground",
            )}
          >
            {i < currentIndex ? completedIcon : i + 1}
          </div>
          <span
            className={cn(
              "hidden text-sm sm:inline",
              i === currentIndex ? "font-medium" : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && <Separator className="hidden w-8 sm:block" />}
        </div>
      ))}
    </div>
  );
}
