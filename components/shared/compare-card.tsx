import { EnrichedMatch } from "@/services/matches";
import { formatKg, formatPriceRange } from "@/lib/format";
import { CompatibilityScoreBadge } from "./compatibility-score";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";

export function CompareCard({
  match,
  badge,
}: {
  match: EnrichedMatch;
  badge?: string;
}) {
  const { computed } = match;
  return (
    <div className={cn("relative flex min-w-[240px] flex-1 flex-col rounded-xl border bg-card p-4 shadow-sm", badge ? "border-primary" : "border-border")}>
      {badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2">
        <CompanyAvatar
          photoUrl={computed.generatorCompany.contactPhotoUrl}
          initials={computed.generatorCompany.logoInitials}
          name={computed.generatorCompany.name}
        />
        <div>
          <p className="text-sm font-semibold text-foreground">{computed.generatorCompany.name}</p>
          <p className="text-xs text-muted-foreground">{computed.material.materialType}</p>
        </div>
      </div>

      <div className="mt-3">
        <CompatibilityScoreBadge overall={computed.score.overall} />
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Cantidad" value={formatKg(computed.material.quantity)} />
        <Row label="Calidad" value={computed.material.cleanliness} />
        <Row label="Distancia" value={`${computed.score.distanceKm} km`} />
        <Row
          label="Precio"
          value={formatPriceRange(computed.material.expectedPriceMin ?? 1, computed.material.expectedPriceMax ?? 2)}
        />
        <Row
          label="Reputación"
          value={
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" /> {computed.generatorCompany.rating.toFixed(1)}
            </span>
          }
        />
        <Row label="Disponibilidad" value={computed.material.availability} />
      </dl>

      <Button asChild size="sm" className="mt-4">
        <Link href={`/matches/${match.key}`}>Ver oportunidad</Link>
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
