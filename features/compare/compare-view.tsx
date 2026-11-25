"use client";

import { useMemo, useState } from "react";
import { useCurrentCompany, useStore } from "@/lib/store";
import { getMatchesForCompany, EnrichedMatch } from "@/services/matches";
import { PageHeader } from "@/components/shared/page-header";
import { CompareCard } from "@/components/shared/compare-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompatibilityScoreBadge } from "@/components/shared/compatibility-score";
import { formatKg } from "@/lib/format";

export function CompareView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const allMatches = useMemo(() => (company ? getMatchesForCompany(state, company) : []), [state, company]);
  const [selected, setSelected] = useState<string[]>(() => allMatches.slice(0, 3).map((m) => m.key));

  if (!company) return null;

  function toggle(key: string) {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 4) return prev;
      return [...prev, key];
    });
  }

  const chosen = allMatches.filter((m) => selected.includes(m.key));
  const badges = computeBadges(chosen);

  return (
    <div className="space-y-5">
      <PageHeader title="Comparar ofertas" subtitle="Seleccioná entre 2 y 4 oportunidades para compararlas lado a lado." />

      {allMatches.length === 0 ? (
        <EmptyState icon={Scale} title="No hay oportunidades para comparar" description="Cuando EVA encuentre matches, vas a poder compararlos acá." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {allMatches.map((m) => (
              <label
                key={m.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                  selected.includes(m.key) ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <Checkbox checked={selected.includes(m.key)} onCheckedChange={() => toggle(m.key)} />
                {m.computed.generatorCompany.name}
                <CompatibilityScoreBadge overall={m.computed.score.overall} />
              </label>
            ))}
          </div>

          {chosen.length < 2 ? (
            <EmptyState icon={Scale} title="Seleccioná al menos 2 oportunidades" description="Marcá las opciones que querés comparar." />
          ) : (
            <div className="flex flex-col gap-4 overflow-x-auto pb-2 sm:flex-row">
              {chosen.map((m) => (
                <CompareCard key={m.key} match={m} badge={badges.get(m.key)} />
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Volumen total seleccionado: {formatKg(chosen.reduce((s, m) => s + m.computed.material.quantity, 0))}
          </p>
        </>
      )}
    </div>
  );
}

function computeBadges(matches: EnrichedMatch[]): Map<string, string> {
  const badges = new Map<string, string>();
  if (matches.length === 0) return badges;

  const best = [...matches].sort((a, b) => b.computed.score.overall - a.computed.score.overall)[0];
  badges.set(best.key, "Mejor equilibrio");

  const cheapest = [...matches].sort(
    (a, b) => (a.computed.material.expectedPriceMin ?? 99) - (b.computed.material.expectedPriceMin ?? 99),
  )[0];
  if (!badges.has(cheapest.key)) badges.set(cheapest.key, "Más económico");

  const closest = [...matches].sort((a, b) => a.computed.score.distanceKm - b.computed.score.distanceKm)[0];
  if (!badges.has(closest.key)) badges.set(closest.key, "Más cercano");

  const biggest = [...matches].sort((a, b) => b.computed.material.quantity - a.computed.material.quantity)[0];
  if (!badges.has(biggest.key)) badges.set(biggest.key, "Mayor volumen");

  return badges;
}
