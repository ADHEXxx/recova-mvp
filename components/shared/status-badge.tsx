import { cn } from "@/lib/utils";
import { MaterialStatus, MatchStatus, OperationStatus, RequirementStatus } from "@/types";

type AnyStatus = MaterialStatus | RequirementStatus | MatchStatus | OperationStatus | string;

const STYLES: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  Disponible: "bg-success/15 text-success border-success/30",
  available: "bg-secondary text-secondary-foreground border-border",
  grouped: "bg-accent text-accent-foreground border-accent",
  sold: "bg-muted text-muted-foreground border-border",
  paused: "bg-warning/15 text-warning-foreground border-warning/30",
  completed: "bg-success/15 text-success border-success/30",
  interest_sent: "bg-accent text-accent-foreground border-accent",
  mutual_interest: "bg-accent text-accent-foreground border-accent",
  negotiation: "bg-warning/15 text-warning-foreground border-warning/30",
  confirmed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const LABELS: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  sold: "Vendido",
  grouped: "Agrupado",
  completed: "Completado",
  available: "Sin contactar",
  interest_sent: "Interés enviado",
  mutual_interest: "Interés mutuo",
  negotiation: "En negociación",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

export function StatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  const style = STYLES[status] ?? "bg-secondary text-secondary-foreground border-border";
  const label = LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
