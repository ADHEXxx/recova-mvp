import { TimelineStep } from "@/types";
import { formatDate } from "@/lib/format";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TransactionTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => (
        <li key={step.step} className="relative flex gap-3 pb-6 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-[calc(100%-8px)] w-px",
                step.done ? "bg-success" : "bg-border",
              )}
            />
          )}
          <span
            className={cn(
              "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
              step.done ? "border-success bg-success text-success-foreground" : "border-border bg-card text-transparent",
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
          <div className="pt-0.5">
            <p className={cn("text-sm font-medium", step.done ? "text-foreground" : "text-muted-foreground")}>
              {step.step}
            </p>
            {step.done && <p className="text-xs text-muted-foreground">{formatDate(step.date)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
