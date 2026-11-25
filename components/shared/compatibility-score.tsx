import { cn } from "@/lib/utils";
import { ScoreBreakdown } from "@/types";

const LABELS: Record<keyof ScoreBreakdown, string> = {
  material: "Material",
  quality: "Calidad",
  volume: "Volumen",
  distance: "Distancia",
  availability: "Disponibilidad",
  frequency: "Frecuencia",
  reliability: "Reputación",
};

function tone(score: number) {
  if (score >= 85) return { text: "text-success", bar: "bg-success", label: "Alta compatibilidad" };
  if (score >= 70) return { text: "text-primary", bar: "bg-primary", label: "Buena compatibilidad" };
  if (score >= 50) return { text: "text-warning-foreground", bar: "bg-warning", label: "Compatibilidad media" };
  return { text: "text-destructive", bar: "bg-destructive", label: "No recomendado" };
}

export function CompatibilityScoreBadge({ overall, className }: { overall: number; className?: string }) {
  const t = tone(overall);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        t.text,
        className,
      )}
    >
      {overall}% compatible
    </span>
  );
}

export function CompatibilityScore({
  overall,
  breakdown,
  compact = false,
}: {
  overall: number;
  breakdown: ScoreBreakdown;
  compact?: boolean;
}) {
  const t = tone(overall);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <span className={cn("text-3xl font-bold tracking-tight", t.text)}>{overall}%</span>
          <span className="ml-2 text-sm text-muted-foreground">compatible</span>
        </div>
        <span className={cn("text-xs font-medium", t.text)}>{t.label}</span>
      </div>
      <div className={cn("mt-4 space-y-3", compact && "mt-3 space-y-2")}>
        {(Object.keys(breakdown) as (keyof ScoreBreakdown)[]).map((key) => {
          const val = breakdown[key];
          const barTone = tone(val);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{LABELS[key]}</span>
                <span className="font-medium text-foreground">{val}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className={cn("h-full rounded-full", barTone.bar)} style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
