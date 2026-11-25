import Link from "next/link";
import { MapPin, PackageCheck, Scale, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { CompatibilityScoreBadge } from "./compatibility-score";
import { formatKg, formatPriceRange } from "@/lib/format";
import { EnrichedMatch } from "@/services/matches";
import { Role } from "@/types";
import { CompanyAvatar } from "./company-avatar";

export function MatchCard({ match, perspective }: { match: EnrichedMatch; perspective: Role }) {
  const { computed } = match;
  const counterparty = perspective === "GENERATOR" ? computed.buyerCompany : computed.generatorCompany;
  const isGenerator = perspective === "GENERATOR";

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyAvatar photoUrl={counterparty.contactPhotoUrl} initials={counterparty.logoInitials} name={counterparty.name} size="default" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{counterparty.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{computed.material.materialType} · {computed.material.cleanliness}</p>
          </div>
        </div>
        <CompatibilityScoreBadge overall={computed.score.overall} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border text-sm">
        <MatchDatum icon={PackageCheck} label={isGenerator ? "La empresa necesita" : "Cantidad ofrecida"} value={isGenerator ? `${formatKg(computed.requirement.minQuantity)}–${formatKg(computed.requirement.idealQuantity)}` : formatKg(computed.material.quantity)} />
        <MatchDatum icon={Scale} label={isGenerator ? "Tu cantidad publicada" : "Cantidad solicitada"} value={isGenerator ? formatKg(computed.material.quantity) : `${formatKg(computed.requirement.minQuantity)}–${formatKg(computed.requirement.idealQuantity)}`} />
        <MatchDatum icon={MapPin} label="Distancia" value={`${computed.score.distanceKm} km`} />
        <MatchDatum icon={WalletCards} label="Valor estimado" value={formatPriceRange(computed.material.expectedPriceMin ?? 1, computed.material.expectedPriceMax ?? 2)} />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge status={match.status} />
        <Button asChild size="sm" className="w-full sm:w-auto"><Link href={`/matches/${match.key}`}>Ver oportunidad</Link></Button>
      </div>
    </article>
  );
}

function MatchDatum({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="min-w-0 bg-secondary/55 p-3"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</p><p className="mt-1 truncate font-semibold text-foreground">{value}</p></div>;
}
