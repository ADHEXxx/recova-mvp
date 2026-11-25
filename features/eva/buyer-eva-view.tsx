"use client";

import Link from "next/link";
import { Company } from "@/types";
import { useStore } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { buyerRecommendations } from "@/lib/eva/recommendations";
import { buildGroupedLot } from "@/lib/eva/grouping";
import { EvaModuleCard } from "@/components/shared/eva-module-card";
import { EvaSummary } from "@/components/shared/eva-summary";
import { EvaRecommendationCard } from "@/components/shared/eva-recommendation";
import { MatchCard } from "@/components/shared/match-card";
import { CompatibilityScore } from "@/components/shared/compatibility-score";
import { GroupedLotCard } from "@/components/shared/grouped-lot-card";
import { NotificationCard } from "@/components/shared/notification-card";
import { formatKg } from "@/lib/format";
import { Handshake, BarChart3, Scale, Boxes, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BuyerEvaView({ company }: { company: Company }) {
  const { state } = useStore();
  const myRequirements = state.requirements.filter((r) => r.companyId === company.id);
  const activeRequirements = myRequirements.filter((r) => r.status === "active");
  const matches = getMatchesForCompany(state, company);
  const recommendations = buyerRecommendations(company, myRequirements, state.materials);

  const focusRequirement = activeRequirements[0];
  const topMatch = matches[0];

  const lot = focusRequirement ? buildGroupedLot(focusRequirement, state.materials, undefined, state.companies) : null;

  const compatibleGenerators = new Set(matches.map((m) => m.computed.generatorCompany.id)).size;
  const availableVolume = matches.reduce((s, m) => s + m.computed.material.quantity, 0);

  const summaryLines = focusRequirement
    ? [
        `Necesitás ${formatKg(focusRequirement.idealQuantity)} de ${focusRequirement.materialType}.`,
        `Encontramos ${compatibleGenerators} generador${compatibleGenerators === 1 ? "" : "es"} con ${formatKg(availableVolume)} combinados.`,
        lot
          ? "Existe una agrupación potencial que puede completar tu requerimiento."
          : "Todavía no hay una agrupación disponible para completar tu requerimiento.",
      ]
    : ["Todavía no tenés necesidades activas. Creá una para que EVA empiece a buscar."];

  const alerts = state.notifications.filter(
    (n) => n.companyId === company.id && (n.type === "match" || n.type === "grouping"),
  );

  return (
    <div className="space-y-6">
      <EvaSummary lines={summaryLines} />

      <div className="grid gap-4 lg:grid-cols-2">
        <EvaModuleCard icon={Handshake} title="Matchmaking inteligente">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">EVA todavía no encontró generadores compatibles.</p>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 2).map((m) => (
                <MatchCard key={m.key} match={m} perspective="BUYER" />
              ))}
            </div>
          )}
        </EvaModuleCard>

        {topMatch && (
          <EvaModuleCard icon={BarChart3} title="Score de compatibilidad">
            <CompatibilityScore overall={topMatch.computed.score.overall} breakdown={topMatch.computed.score.breakdown} compact />
          </EvaModuleCard>
        )}

        <EvaModuleCard icon={Scale} title="Comparación de ofertas">
          <p className="text-sm text-muted-foreground">
            Compará material, volumen, calidad, distancia, precio y reputación entre varias oportunidades.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/compare">Comparar ofertas</Link>
          </Button>
        </EvaModuleCard>

        {lot && (
          <EvaModuleCard icon={Boxes} title="Agrupación automática">
            <GroupedLotCard lot={lot} currentCompanyId={company.id} />
          </EvaModuleCard>
        )}

        <EvaModuleCard icon={BellRing} title="Alertas">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenés alertas nuevas por ahora.</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 3).map((n) => (
                <NotificationCard key={n.id} notification={n} />
              ))}
            </div>
          )}
        </EvaModuleCard>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Recomendaciones de EVA</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((rec) => (
            <EvaRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}
