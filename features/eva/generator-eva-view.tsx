"use client";

import { useState } from "react";
import { Company } from "@/types";
import { useStore } from "@/lib/store";
import { EvaModuleCard } from "@/components/shared/eva-module-card";
import { CompanyCard } from "@/components/shared/company-card";
import { GroupedLotCard } from "@/components/shared/grouped-lot-card";
import { EvaRecommendationCard } from "@/components/shared/eva-recommendation";
import { EvaSummary } from "@/components/shared/eva-summary";
import { formatKg } from "@/lib/format";
import { estimateMaterialValue, projectVolumeGrowth } from "@/lib/eva/valuation";
import { classifyMaterial } from "@/lib/eva/classify";
import { findMatchesForMaterial } from "@/lib/eva/matching";
import { buildGroupedLot } from "@/lib/eva/grouping";
import { generatorRecommendations } from "@/lib/eva/recommendations";
import { Tags, TrendingUp, Target, Boxes, LineChart, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GeneratorEvaView({ company }: { company: Company }) {
  const { state } = useStore();
  const [classificationConfirmed, setClassificationConfirmed] = useState(false);

  const myMaterials = state.materials.filter((m) => m.companyId === company.id);
  const activeMaterials = myMaterials.filter((m) => m.status === "active");
  const focusMaterial = activeMaterials[0];

  const recommendations = generatorRecommendations(company, myMaterials, state.requirements, state.materials);

  const matchesForFocus = focusMaterial ? findMatchesForMaterial(focusMaterial, state.requirements, state.companies) : [];

  const focusRequirement = matchesForFocus[0]?.requirement;
  const lot = focusMaterial && focusRequirement ? buildGroupedLot(focusRequirement, state.materials, focusMaterial.id, state.companies) : null;

  const kgAvailable = activeMaterials.reduce((s, m) => s + m.quantity, 0);
  const compatibleCount = new Set(
    activeMaterials.flatMap((m) => findMatchesForMaterial(m, state.requirements, state.companies).map((mm) => mm.buyerCompany.id)),
  ).size;

  const summaryLines = [
    `Tenés ${formatKg(kgAvailable)} de material disponible.`,
    `Encontramos ${compatibleCount} empresa${compatibleCount === 1 ? "" : "s"} compatible${compatibleCount === 1 ? "" : "s"}.`,
    lot
      ? `Existe un lote agrupado disponible con ${formatKg(lot.totalQuantity)} combinados.`
      : "Todavía no hay una agrupación disponible para tus materiales.",
  ];

  return (
    <div className="space-y-6">
      <EvaSummary lines={summaryLines} />

      <div className="grid gap-4 lg:grid-cols-2">
        {focusMaterial && (
          <EvaModuleCard icon={Tags} title="Clasificación automática">
            <p className="text-sm text-muted-foreground">
              Tu publicación: <span className="text-foreground">&quot;{focusMaterial.description}&quot;</span>
            </p>
            {(() => {
              const classification = classifyMaterial(focusMaterial.description, focusMaterial.category);
              return (
                <>
                  <p className="mt-2 text-sm text-foreground">
                    Posible clasificación: <strong>{classification.material}</strong> ({classification.confidence}% de confianza)
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant={classificationConfirmed ? "outline" : "default"}
                      onClick={() => {
                        setClassificationConfirmed(true);
                        toast.success("Clasificación confirmada");
                      }}
                      className="gap-1.5"
                    >
                      {classificationConfirmed && <Check className="h-3.5 w-3.5" />}
                      {classificationConfirmed ? "Confirmado" : "Confirmar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => toast.info("Podés editar la clasificación desde el material")}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Cambiar
                    </Button>
                  </div>
                </>
              );
            })()}
          </EvaModuleCard>
        )}

        {focusMaterial &&
          (() => {
            const value = estimateMaterialValue(focusMaterial, matchesForFocus.length);
            return (
              <EvaModuleCard icon={TrendingUp} title="Estimación de valor">
                <p className="text-2xl font-bold text-primary">
                  Bs {value.minPrice.toFixed(2)}–{value.maxPrice.toFixed(2)}/{focusMaterial.unit}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{value.explanation}</p>
                <p className="mt-2 text-xs italic text-muted-foreground">Estimación orientativa, no un precio garantizado.</p>
              </EvaModuleCard>
            );
          })()}

        {focusMaterial && matchesForFocus.length > 0 && (
          <EvaModuleCard icon={Target} title="Mejor destino">
            <p className="text-sm text-foreground">
              EVA recomienda buscar empresas transformadoras de <strong>{focusMaterial.materialType}</strong>.
            </p>
            <div className="mt-3 space-y-2">
              {matchesForFocus.slice(0, 3).map((m) => (
                <CompanyCard key={m.buyerCompany.id} company={m.buyerCompany} />
              ))}
            </div>
          </EvaModuleCard>
        )}

        {lot && (
          <EvaModuleCard icon={Boxes} title="Agrupación inteligente">
            <p className="text-sm text-muted-foreground">
              Tu lote actual es de {formatKg(focusMaterial!.quantity)}. Encontramos otros lotes compatibles que podrían formar un
              total de {formatKg(lot.totalQuantity)}.
            </p>
            <div className="mt-3">
              <GroupedLotCard lot={lot} currentCompanyId={company.id} />
            </div>
          </EvaModuleCard>
        )}

        {focusMaterial && (
          <EvaModuleCard icon={LineChart} title="Predicción de volumen">
            <p className="text-sm text-foreground">
              Según tu historial, podrías generar otros{" "}
              <strong>{formatKg(projectVolumeGrowth(focusMaterial.quantity * 0.3, 4))}</strong> en aproximadamente 4 días si
              mantenés tu ritmo actual de generación.
            </p>
          </EvaModuleCard>
        )}

        {!focusMaterial && (
          <EvaModuleCard icon={Tags} title="Clasificación automática">
            <p className="text-sm text-muted-foreground">
              Publicá tu primer material para que EVA empiece a clasificarlo y estimar su valor.
            </p>
          </EvaModuleCard>
        )}
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
