"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { PageHeader } from "@/components/shared/page-header";
import { RequirementCard } from "@/components/shared/requirement-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { RequirementStatus } from "@/types";
import { toast } from "sonner";

const TABS: { value: RequirementStatus; label: string }[] = [
  { value: "active", label: "Activas" },
  { value: "completed", label: "Completadas" },
  { value: "paused", label: "Pausadas" },
];

export function RequirementsListView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateRequirement } = useStoreActions();
  const [tab, setTab] = useState<RequirementStatus>("active");

  const myRequirements = useMemo(
    () => state.requirements.filter((r) => r.companyId === company?.id),
    [state.requirements, company?.id],
  );

  const matchCounts = useMemo(() => {
    if (!company) return new Map<string, number>();
    const enriched = getMatchesForCompany(state, company);
    const map = new Map<string, number>();
    for (const em of enriched) {
      map.set(em.computed.requirement.id, (map.get(em.computed.requirement.id) ?? 0) + 1);
    }
    return map;
  }, [state, company]);

  if (!company) return null;

  const filtered = myRequirements.filter((r) => r.status === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis necesidades"
        subtitle="Gestioná lo que tu empresa necesita abastecer."
        action={
          <Button asChild size="sm">
            <Link href="/requirements/new">Crear necesidad</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as RequirementStatus)}>
        <TabsList className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex-1 sm:flex-none">
              {t.label}
              <span className="ml-1 text-xs text-muted-foreground">
                ({myRequirements.filter((r) => r.status === t.value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tenés necesidades en esta categoría"
          description="Creá una necesidad para que EVA empiece a buscar generadores compatibles."
          actionLabel={tab === "active" ? "Crear necesidad" : undefined}
          actionHref={tab === "active" ? "/requirements/new" : undefined}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="space-y-2">
              <RequirementCard requirement={r} matchesCount={matchCounts.get(r.id) ?? 0} href={`/requirements/${r.id}`} />
              {r.status === "active" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    updateRequirement(r.id, { status: "paused" });
                    toast.success("Necesidad pausada");
                  }}
                >
                  Pausar necesidad
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
