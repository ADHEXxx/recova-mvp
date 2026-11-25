"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { PageHeader } from "@/components/shared/page-header";
import { MaterialCard } from "@/components/shared/material-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { MaterialStatus } from "@/types";
import { toast } from "sonner";

const TABS: { value: MaterialStatus; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "grouped", label: "Agrupados" },
  { value: "sold", label: "Vendidos" },
  { value: "paused", label: "Pausados" },
];

export function MaterialsListView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateMaterial } = useStoreActions();
  const [tab, setTab] = useState<MaterialStatus>("active");

  const myMaterials = useMemo(
    () => state.materials.filter((m) => m.companyId === company?.id),
    [state.materials, company?.id],
  );

  const matchCounts = useMemo(() => {
    if (!company) return new Map<string, number>();
    const enriched = getMatchesForCompany(state, company);
    const map = new Map<string, number>();
    for (const em of enriched) {
      map.set(em.computed.material.id, (map.get(em.computed.material.id) ?? 0) + 1);
    }
    return map;
  }, [state, company]);

  if (!company) return null;

  const filtered = myMaterials.filter((m) => m.status === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis materiales"
        subtitle="Gestioná tus publicaciones y su estado."
        action={
          <Button asChild size="sm">
            <Link href="/materials/new">Publicar material</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as MaterialStatus)}>
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex-1 sm:flex-none">
              {t.label}
              <span className="ml-1 text-xs text-muted-foreground">
                ({myMaterials.filter((m) => m.status === t.value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No tenés materiales en esta categoría"
          description="Cuando publiques o actualices materiales, aparecerán acá."
          actionLabel={tab === "active" ? "Publicar primer material" : undefined}
          actionHref={tab === "active" ? "/materials/new" : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              matchesCount={matchCounts.get(m.id) ?? 0}
              href={`/materials/${m.id}`}
              footer={
                <div className="flex gap-1.5">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/materials/${m.id}`}>Editar</Link>
                  </Button>
                  {m.status === "active" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        updateMaterial(m.id, { status: "paused" });
                        toast.success("Material pausado");
                      }}
                    >
                      Pausar
                    </Button>
                  ) : m.status === "paused" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        updateMaterial(m.id, { status: "active" });
                        toast.success("Material reactivado");
                      }}
                    >
                      Reactivar
                    </Button>
                  ) : null}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
