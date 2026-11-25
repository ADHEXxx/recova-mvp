"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import { useCurrentCompany, useStore, useStoreActions, matchKey } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, MapPin } from "lucide-react";
import { formatKg, formatDate } from "@/lib/format";
import { findMatchesForRequirement } from "@/lib/eva/matching";
import { buildGroupedLot } from "@/lib/eva/grouping";
import { MatchCard } from "@/components/shared/match-card";
import { GroupedLotCard } from "@/components/shared/grouped-lot-card";
import { toast } from "sonner";
import Link from "next/link";

export function RequirementDetailView({ requirementId }: { requirementId: string }) {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateRequirement } = useStoreActions();

  const requirement = state.requirements.find((r) => r.id === requirementId);

  const matches = useMemo(() => {
    if (!requirement) return [];
    const visibleMaterials = company?.id === requirement.companyId
      ? state.materials
      : company?.role === "GENERATOR"
        ? state.materials.filter((material) => material.companyId === company.id)
        : [];
    return findMatchesForRequirement(requirement, visibleMaterials, state.companies).map((computed) => {
      const key = matchKey(computed.material.id, computed.requirement.id);
      return {
        key,
        computed,
        status: state.matchOverrides[key] ?? ("available" as const),
        saved: state.savedMatchKeys.includes(key),
      };
    });
  }, [company, requirement, state.materials, state.companies, state.matchOverrides, state.savedMatchKeys]);

  const lot = useMemo(() => {
    if (!requirement) return null;
    return buildGroupedLot(requirement, state.materials, undefined, state.companies);
  }, [requirement, state.materials, state.companies]);

  if (!requirement) return notFound();
  const isOwner = company?.id === requirement.companyId;

  return (
    <div className="space-y-5">
      <PageHeader
        title={requirement.materialType}
        subtitle={`Creado el ${formatDate(requirement.createdAt)}`}
        action={<StatusBadge status={requirement.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <ClipboardList className="h-7 w-7 text-primary/60" />
              </div>
              <div>
                <p className="text-sm text-foreground">{requirement.specifications}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {requirement.city} · radio {requirement.radiusKm} km
                  </span>
                  <span>Calidad mínima: {requirement.minQuality}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Mínimo" value={formatKg(requirement.minQuantity, requirement.unit)} />
              <Stat label="Ideal" value={formatKg(requirement.idealQuantity, requirement.unit)} />
              <Stat label="Frecuencia" value={requirement.frequency} />
              <Stat label="Alternativos" value={requirement.alternativeMaterials.join(", ") || "Ninguno"} />
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {isOwner ? `Ofertas compatibles (${matches.length})` : `Tus materiales compatibles (${matches.length})`}
            </h3>
            {matches.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {isOwner
                  ? "EVA todavía no encontró ofertas compatibles para esta solicitud."
                  : "No tenés un material publicado que sea compatible con esta solicitud."}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {matches.slice(0, 4).map((m) => (
                  <MatchCard key={m.key} match={m} perspective={isOwner ? "BUYER" : "GENERATOR"} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {!isOwner && company?.role === "GENERATOR" && requirement.status === "active" && (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-foreground">¿Tenés este material ahora?</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                No necesitás tener una publicación previa ni generar este material con frecuencia.
              </p>
              <Button asChild className="mt-4 min-h-11 w-full">
                <Link href={`/materials/new?requirement=${encodeURIComponent(requirement.id)}`}>Ofrecer material</Link>
              </Button>
            </Card>
          )}
          {isOwner && requirement.status === "active" && (
            <Card className="space-y-2 p-4">
              <h3 className="text-sm font-semibold text-foreground">Gestionar necesidad</h3>
              <Button asChild className="w-full" variant="outline">
                <Link href="/compare">Comparar ofertas</Link>
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  updateRequirement(requirement.id, { status: "paused" });
                  toast.success("Necesidad pausada");
                }}
              >
                Pausar necesidad
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  updateRequirement(requirement.id, { status: "completed" });
                  toast.success("Necesidad marcada como completada");
                }}
              >
                Marcar como completada
              </Button>
            </Card>
          )}

          {lot && <GroupedLotCard lot={lot} currentCompanyId={company?.id} />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
