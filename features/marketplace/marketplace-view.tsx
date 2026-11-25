"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Boxes, ClipboardList, PackageSearch, Search } from "lucide-react";
import { useCurrentCompany, useStore } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimulateQrButton } from "@/features/materials/simulate-qr-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialCard } from "@/components/shared/material-card";
import { RequirementCard } from "@/components/shared/requirement-card";
import { GroupedLotCard } from "@/components/shared/grouped-lot-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSheet } from "@/components/shared/filter-sheet";
import { buildGroupedLot } from "@/lib/eva/grouping";
import {
  MarketplaceFilterForm,
  MarketplaceFiltersState,
  countActiveFilters,
  defaultMarketplaceFilters,
} from "./marketplace-filters";
import { Cleanliness, Company, Material, Requirement } from "@/types";

const CLEANLINESS_RANK: Record<Cleanliness, number> = {
  "Muy limpio": 4,
  Limpio: 3,
  Regular: 2,
  "Con impurezas": 1,
};

function matchesSearch(value: string, query: string) {
  return value.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"));
}

export function MarketplaceView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MarketplaceFiltersState>(defaultMarketplaceFilters);
  const isGenerator = company?.role === "GENERATOR";

  const materials = useMemo(
    () => filterMaterials(state.materials, state.companies, query, filters, company?.id),
    [state.materials, state.companies, query, filters, company?.id],
  );

  const requirements = useMemo(
    () => filterRequirements(state.requirements, query, filters, company?.id),
    [state.requirements, query, filters, company?.id],
  );

  const groupedLots = useMemo(() => {
    if (!company || company.role !== "BUYER") return [];
    return state.requirements
      .filter((requirement) => requirement.companyId === company.id && requirement.status === "active")
      .filter((requirement) => !query || matchesSearch(`${requirement.materialType} ${requirement.specifications}`, query))
      .filter((requirement) => filters.materialType === "all" || requirement.materialType === filters.materialType)
      .filter((requirement) => filters.category === "all" || requirement.category === filters.category)
      .filter((requirement) => filters.city === "all" || requirement.city === filters.city)
      .map((requirement) => buildGroupedLot(requirement, state.materials, undefined, state.companies))
      .filter((lot): lot is NonNullable<typeof lot> => Boolean(lot));
  }, [company, state.requirements, state.materials, state.companies, query, filters]);

  if (!company) return null;
  const activeCount = countActiveFilters(filters, isGenerator ? "requirements" : "materials");
  const subtitle = isGenerator
    ? "Encontrá empresas que necesitan los materiales que generás o recolectás."
    : "Revisá ofertas de recolectores y lotes agrupados para tus solicitudes.";

  const controls = (
    <>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isGenerator ? "Buscar una solicitud…" : "Buscar material…"}
          aria-label={isGenerator ? "Buscar solicitudes" : "Buscar ofertas"}
          className="pl-9"
        />
      </div>
      <FilterSheet activeCount={activeCount} onClear={() => setFilters(defaultMarketplaceFilters)}>
        <MarketplaceFilterForm mode={isGenerator ? "requirements" : "materials"} value={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} />
      </FilterSheet>
    </>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Materiales" subtitle={subtitle} action={
        <Button asChild variant="outline">
          <Link href={isGenerator ? "/materials" : "/requirements"}>{isGenerator ? "Mis materiales" : "Mis necesidades"}</Link>
        </Button>
      } />
      {isGenerator && <SimulateQrButton />}
      <div className="flex items-center gap-2">{controls}</div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-xl border border-border bg-card p-4 lg:block">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Filtros</h2>
          <MarketplaceFilterForm mode={isGenerator ? "requirements" : "materials"} value={filters} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} />
        </aside>

        {isGenerator ? (
          <RequirementsResults requirements={requirements} materials={state.materials} />
        ) : (
          <Tabs defaultValue="offers" className="min-w-0">
            <TabsList className="grid h-11 w-full grid-cols-2 p-1 sm:w-80">
              <TabsTrigger value="offers" className="min-h-9">Ofertas <span className="text-xs text-muted-foreground">{materials.length}</span></TabsTrigger>
              <TabsTrigger value="lots" className="min-h-9">Lotes agrupados <span className="text-xs text-muted-foreground">{groupedLots.length}</span></TabsTrigger>
            </TabsList>
            <TabsContent value="offers" className="mt-4">
              {materials.length === 0 ? (
                <EmptyState icon={PackageSearch} title="No hay ofertas con estos filtros" description="Probá cambiar la búsqueda o ampliá los filtros." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {materials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      seller={state.companies.find((seller) => seller.id === material.companyId)}
                      href={`/materials/${material.id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="lots" className="mt-4">
              {groupedLots.length === 0 ? (
                <EmptyState icon={Boxes} title="Todavía no hay lotes agrupados" description="Los lotes aparecen cuando dos o más ofertas compatibles completan una de tus solicitudes activas." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groupedLots.map((lot) => <GroupedLotCard key={lot.id} lot={lot} currentCompanyId={company.id} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function RequirementsResults({ requirements, materials }: { requirements: Requirement[]; materials: Material[] }) {
  if (requirements.length === 0) {
    return <EmptyState icon={ClipboardList} title="No hay solicitudes con estos filtros" description="Probá cambiar la búsqueda o ampliá los filtros." />;
  }
  return (
    <section aria-label="Solicitudes de empresas">
      <p className="mb-3 text-sm text-muted-foreground">{requirements.length} solicitudes de empresas</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {requirements.map((requirement) => {
          const matchesCount = materials.filter((material) => material.status === "active" && (material.materialType === requirement.materialType || requirement.alternativeMaterials.includes(material.materialType))).length;
          return <RequirementCard key={requirement.id} requirement={requirement} matchesCount={matchesCount} href={`/requirements/${requirement.id}`} />;
        })}
      </div>
    </section>
  );
}

function filterMaterials(materials: Material[], companies: Company[], query: string, filters: MarketplaceFiltersState, currentCompanyId?: string) {
  return materials
    .filter((material) => material.status === "active" && material.companyId !== currentCompanyId)
    .filter((material) => {
      const seller = companies.find((company) => company.id === material.companyId);
      return !query || matchesSearch(`${seller?.name ?? ""} ${material.name} ${material.materialType}`, query);
    })
    .filter((material) => filters.materialType === "all" || material.materialType === filters.materialType)
    .filter((material) => filters.category === "all" || material.category === filters.category)
    .filter((material) => filters.city === "all" || material.city === filters.city)
    .filter((material) => filters.availability === "all" || material.availability === filters.availability)
    .filter((material) => filters.cleanliness === "all" || CLEANLINESS_RANK[material.cleanliness] >= CLEANLINESS_RANK[filters.cleanliness as Cleanliness])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function filterRequirements(requirements: Requirement[], query: string, filters: MarketplaceFiltersState, currentCompanyId?: string) {
  return requirements
    .filter((requirement) => requirement.status === "active" && !requirement.targetMaterialId && requirement.companyId !== currentCompanyId)
    .filter((requirement) => !query || matchesSearch(`${requirement.materialType} ${requirement.specifications}`, query))
    .filter((requirement) => filters.materialType === "all" || requirement.materialType === filters.materialType)
    .filter((requirement) => filters.category === "all" || requirement.category === filters.category)
    .filter((requirement) => filters.city === "all" || requirement.city === filters.city)
    .filter((requirement) => filters.cleanliness === "all" || CLEANLINESS_RANK[requirement.minQuality] >= CLEANLINESS_RANK[filters.cleanliness as Cleanliness])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
