import { MatchStatus } from "@/types";

export interface MatchAction {
  label: string;
  next: MatchStatus;
  variant: "default" | "outline" | "ghost";
}

export function nextActionsFor(status: MatchStatus): MatchAction[] {
  switch (status) {
    case "available":
      return [
        { label: "Me interesa", next: "interest_sent", variant: "default" },
        { label: "Descartar", next: "cancelled", variant: "ghost" },
      ];
    case "interest_sent":
      return [
        { label: "Confirmar interés mutuo", next: "mutual_interest", variant: "default" },
        { label: "Descartar", next: "cancelled", variant: "ghost" },
      ];
    case "mutual_interest":
      return [{ label: "Iniciar negociación", next: "negotiation", variant: "default" }];
    case "negotiation":
      return [{ label: "Confirmar acuerdo", next: "confirmed", variant: "default" }];
    case "confirmed":
      return [{ label: "Marcar como completado", next: "completed", variant: "default" }];
    default:
      return [];
  }
}
