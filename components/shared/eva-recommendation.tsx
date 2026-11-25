import Link from "next/link";
import { cn } from "@/lib/utils";
import { EvaRecommendation as EvaRecommendationType } from "@/types";
import { ChevronRight } from "lucide-react";
import { EvaAvatar } from "./eva-avatar";

const PRIORITY_STYLES: Record<EvaRecommendationType["priority"], string> = {
  ALTA: "bg-destructive/10 text-destructive border-destructive/20",
  MEDIA: "bg-warning/15 text-warning-foreground border-warning/30",
  BAJA: "bg-secondary text-secondary-foreground border-border",
};

export function EvaRecommendationCard({ recommendation }: { recommendation: EvaRecommendationType }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            PRIORITY_STYLES[recommendation.priority],
          )}
        >
          Prioridad {recommendation.priority}
        </span>
        <EvaAvatar size="sm" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{recommendation.text}</p>
      <Link
        href={recommendation.href}
        className="mt-3 inline-flex min-h-10 items-center gap-1 rounded-md text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {recommendation.actionLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
