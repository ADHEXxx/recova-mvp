"use client";

import { Company } from "@/types";
import { useStore } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { buyerRecommendations } from "@/lib/eva/recommendations";
import { MetricCard } from "@/components/shared/metric-card";
import { EvaSummary } from "@/components/shared/eva-summary";
import { EvaRecommendationCard } from "@/components/shared/eva-recommendation";
import { MatchCard } from "@/components/shared/match-card";
import { RequirementCard } from "@/components/shared/requirement-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ClipboardList, Handshake, Scale, Sparkles, Users } from "lucide-react";
import { formatKg } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BuyerDashboardView({ company }: { company: Company }) {
  const { state } = useStore();
  const myRequirements = state.requirements.filter((r) => r.companyId === company.id);
  const activeRequirements = myRequirements.filter((r) => r.status === "active");
  const matches = getMatchesForCompany(state, company);
  const recommendations = buyerRecommendations(company, myRequirements, state.materials);

  const compatibleGenerators = new Set(matches.map((m) => m.computed.generatorCompany.id)).size;
  const availableVolume = matches.reduce((s, m) => s + m.computed.material.quantity, 0);

  const matchCountByRequirement = new Map<string, number>();
  for (const m of matches) {
    const id = m.computed.requirement.id;
    matchCountByRequirement.set(id, (matchCountByRequirement.get(id) ?? 0) + 1);
  }

  const topRec = recommendations[0];
  const summaryLines = [
    activeRequirements.length > 0
      ? `Necesitás ${formatKg(activeRequirements.reduce((s, r) => s + r.idealQuantity, 0))} en total entre tus ${activeRequirements.length} necesidades activas.`
      : "Todavía no publicaste una necesidad activa.",
    matches.length > 0
      ? `Encontramos ${compatibleGenerators} generador${compatibleGenerators === 1 ? "" : "es"} con ${formatKg(availableVolume)} combinados.`
      : "Todavía no encontramos generadores compatibles.",
    topRec ? topRec.text : "Ajustá tus necesidades para ampliar las coincidencias.",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${company.name}`}
        subtitle="EVA encontró materiales compatibles con tus necesidades."
        action={
          <Button asChild size="sm">
            <Link href="/requirements/new">Crear necesidad</Link>
          </Button>
        }
      />

      <EvaSummary lines={summaryLines} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Materiales recomendados por EVA</h2>
            <Link href="/matches" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {matches.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="EVA todavía no encontró materiales compatibles"
              description="Te avisaremos cuando aparezca un material que coincida con tu necesidad."
              actionLabel="Crear necesidad"
              actionHref="/requirements/new"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {matches.slice(0, 4).map((m) => (
                <MatchCard key={m.key} match={m} perspective="BUYER" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Recomendaciones de EVA</h2>
          {recommendations.slice(0, 3).map((rec) => (
            <EvaRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      <section aria-labelledby="buyer-metrics" className="space-y-3">
        <h2 id="buyer-metrics" className="text-base font-semibold text-foreground">Resumen de abastecimiento</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Generadores compatibles" value={String(compatibleGenerators)} icon={Users} accent="accent" />
          <MetricCard label="Necesidades activas" value={String(activeRequirements.length)} icon={ClipboardList} />
          <MetricCard label="Volumen disponible" value={formatKg(availableVolume)} icon={Scale} />
          <MetricCard label="Matches nuevos" value={String(matches.length)} icon={Handshake} accent="accent" />
        </div>
      </section>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Mis necesidades</h2>
          <Link href="/requirements" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        {activeRequirements.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tenés necesidades publicadas todavía"
            description="Contale a EVA qué materiales buscás para empezar a recibir coincidencias."
            actionLabel="Crear necesidad"
            actionHref="/requirements/new"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeRequirements.slice(0, 3).map((r) => (
              <RequirementCard
                key={r.id}
                requirement={r}
                matchesCount={matchCountByRequirement.get(r.id) ?? 0}
                href={`/requirements/${r.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
