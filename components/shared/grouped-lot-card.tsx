import Link from "next/link";
import { GroupedLot } from "@/types";
import { getCompanyById } from "@/data/companies";
import { formatKg } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";

export function GroupedLotCard({ lot, currentCompanyId }: { lot: GroupedLot; currentCompanyId?: string }) {
  const percent = Math.min(100, Math.round((lot.totalQuantity / lot.minRequired) * 100));
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Boxes className="h-4 w-4 text-brand-accent" />
        <h3 className="text-sm font-semibold text-foreground">Agrupación de {lot.materialType}</h3>
      </div>

      <div className="mt-3 space-y-2">
        {lot.members.map((member) => {
          const company = getCompanyById(member.companyId);
          const isYou = member.companyId === currentCompanyId;
          return (
            <div key={member.materialId} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isYou ? "Tu lote" : company?.name ?? "Generador"}
              </span>
              <span className="font-medium text-foreground">{formatKg(member.quantity)}</span>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatKg(lot.totalQuantity)}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Mínimo requerido: {formatKg(lot.minRequired)} — {percent}% cubierto
        </p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-foreground/80">
        {lot.totalQuantity >= lot.minRequired
          ? "EVA: Esta agrupación supera el volumen mínimo requerido."
          : "EVA: Esta agrupación todavía no alcanza el volumen mínimo requerido."}
      </p>

      <Button asChild className="mt-3 w-full" size="sm">
        <Link href={`/grouping/${lot.id}`}>Ver agrupación</Link>
      </Button>
    </div>
  );
}
