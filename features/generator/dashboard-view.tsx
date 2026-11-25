"use client";

import { Company } from "@/types";
import { useStore } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { generatorRecommendations } from "@/lib/eva/recommendations";
import { estimateMaterialValue } from "@/lib/eva/valuation";
import { MetricCard } from "@/components/shared/metric-card";
import { EvaSummary } from "@/components/shared/eva-summary";
import { EvaRecommendationCard } from "@/components/shared/eva-recommendation";
import { MatchCard } from "@/components/shared/match-card";
import { MaterialCard } from "@/components/shared/material-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Package, Handshake, Scale, TrendingUp, Sparkles } from "lucide-react";
import { formatKg, formatBs } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GeneratorDashboardView({ company }: { company: Company }) {
  const { state } = useStore();
  const myMaterials = state.materials.filter((m) => m.companyId === company.id);
  const activeMaterials = myMaterials.filter((m) => m.status === "active");
  const matches = getMatchesForCompany(state, company);
  const recommendations = generatorRecommendations(company, myMaterials, state.requirements, state.materials);

  const kgPublished = activeMaterials.reduce((s, m) => s + m.quantity, 0);
  const potentialValue = activeMaterials.reduce((s, m) => {
    const v = estimateMaterialValue(m);
    return s + ((v.minPrice + v.maxPrice) / 2) * m.quantity;
  }, 0);

  const topRec = recommendations[0];
  const summaryLines = [
    `Tenés ${formatKg(kgPublished)} de material disponible en ${activeMaterials.length} publicaciones activas.`,
    matches.length > 0
      ? `Encontramos ${matches.length} empresa${matches.length === 1 ? "" : "s"} compatible${matches.length === 1 ? "" : "s"}.`
      : "Todavía no encontramos empresas compatibles con tus materiales actuales.",
    topRec ? topRec.text : "Publicá más materiales para que EVA encuentre nuevas oportunidades.",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${company.name}`}
        subtitle="EVA encontró nuevas oportunidades para tus materiales."
        action={
          <Button asChild size="sm">
            <Link href="/materials/new">Publicar material</Link>
          </Button>
        }
      />

      <EvaSummary lines={summaryLines} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Matches recomendados por EVA</h2>
            <Link href="/matches" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {matches.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="EVA todavía no encontró oportunidades compatibles"
              description="Te avisaremos cuando aparezca un match para tus materiales."
              actionLabel="Publicar material"
              actionHref="/materials/new"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {matches.slice(0, 4).map((m) => (
                <MatchCard key={m.key} match={m} perspective="GENERATOR" />
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

      <section aria-labelledby="generator-metrics" className="space-y-3">
        <h2 id="generator-metrics" className="text-base font-semibold text-foreground">Resumen operativo</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Matches encontrados" value={String(matches.length)} icon={Handshake} accent="accent" />
          <MetricCard label="Materiales activos" value={String(activeMaterials.length)} icon={Package} />
          <MetricCard label="Valor potencial" value={formatBs(potentialValue)} icon={TrendingUp} accent="accent" />
          <MetricCard label="Kg publicados" value={formatKg(kgPublished)} icon={Scale} />
        </div>
      </section>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Materiales activos</h2>
          <Link href="/materials" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {activeMaterials.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No tenés materiales publicados todavía"
            description="Publicá tu primer material para que EVA empiece a encontrar oportunidades."
            actionLabel="Publicar primer material"
            actionHref="/materials/new"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeMaterials.slice(0, 3).map((m) => (
              <MaterialCard key={m.id} material={m} href={`/materials/${m.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
