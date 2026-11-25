"use client";

import { useMemo, useState } from "react";
import { useCurrentCompany, useStore } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";
import { PageHeader } from "@/components/shared/page-header";
import { MatchCard } from "@/components/shared/match-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake } from "lucide-react";

type FilterTab = "all" | "high" | "interested" | "negotiation" | "confirmed";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "high", label: "Alta compatibilidad" },
  { value: "interested", label: "Interesados" },
  { value: "negotiation", label: "En negociación" },
  { value: "confirmed", label: "Confirmados" },
];

export function MatchesListView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const [tab, setTab] = useState<FilterTab>("all");

  const matches = useMemo(() => (company ? getMatchesForCompany(state, company) : []), [state, company]);

  const filtered = matches.filter((m) => {
    if (tab === "all") return true;
    if (tab === "high") return m.computed.score.overall >= 85;
    if (tab === "interested") return m.status === "interest_sent" || m.status === "mutual_interest";
    if (tab === "negotiation") return m.status === "negotiation";
    if (tab === "confirmed") return m.status === "confirmed" || m.status === "completed";
    return true;
  });

  if (!company) return null;

  return (
    <div className="space-y-5">
      <PageHeader title="Matches" subtitle="Todas las oportunidades que EVA encontró para tu empresa." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-full border border-border bg-card data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No hay matches en esta categoría"
          description="EVA te avisará apenas encuentre una nueva coincidencia."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard key={m.key} match={m} perspective={company.role} />
          ))}
        </div>
      )}
    </div>
  );
}
