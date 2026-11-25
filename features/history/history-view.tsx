"use client";

import Link from "next/link";
import { useCurrentCompany, useStore } from "@/lib/store";
import { getOperationsForCompany } from "@/data/operations";
import { getCompanyById } from "@/data/companies";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TransactionTimeline } from "@/components/shared/transaction-timeline";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatBs, formatDate, formatKg } from "@/lib/format";
import { History, Star } from "lucide-react";
import { findEnrichedMatchByKey } from "@/services/matches";
import { MatchCard } from "@/components/shared/match-card";
import { Button } from "@/components/ui/button";

export function HistoryView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  if (!company) return null;

  const operations = getOperationsForCompany(company.id);
  const agreements = Object.entries(state.matchOverrides)
    .filter(([, status]) => status === "confirmed" || status === "completed")
    .map(([key]) => findEnrichedMatchByKey(state, key))
    .filter((match) => match && [match.computed.generatorCompany.id, match.computed.buyerCompany.id].includes(company.id));

  return (
    <div className="space-y-5">
      <PageHeader title="Operaciones" subtitle="Consultá tus acuerdos y el historial de retiros." action={
        <Button asChild variant="outline"><Link href="/matches">Ver coincidencias</Link></Button>
      } />
      {agreements.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Acuerdos registrados</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {agreements.map((match) => match && <MatchCard key={match.key} match={match} perspective={company.role} />)}
          </div>
        </section>
      )}

      {operations.length === 0 ? (
        agreements.length === 0 && <EmptyState icon={History} title="Todavía no tenés operaciones" description="Cuando confirmes una coincidencia, verás el acuerdo en esta pantalla." />
      ) : (
        <section className="space-y-3">
        <h2 className="font-semibold">Historial de ejemplo</h2>
        <Card className="divide-y divide-border p-0">
          <Accordion type="single" collapsible>
            {operations.map((op) => {
              const counterpartyId = op.generatorCompanyId === company.id ? op.buyerCompanyId : op.generatorCompanyId;
              const counterparty = getCompanyById(counterpartyId) ?? state.companies.find((c) => c.id === counterpartyId);
              return (
                <AccordionItem key={op.id} value={op.id} className="border-border px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center justify-between gap-3 pr-2 text-left">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{counterparty?.name ?? "Empresa"}</p>
                        <p className="text-xs text-muted-foreground">
                          {op.materialType} · {formatKg(op.quantity, op.unit)} · {formatDate(op.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {op.rating && (
                          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                            <Star className="h-3 w-3 fill-warning text-warning" /> {op.rating}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-foreground">{formatBs(op.value)}</span>
                        <StatusBadge status={op.status === "Operación cerrada" ? "completed" : "active"} />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <TransactionTimeline steps={op.timeline} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
        </section>
      )}
    </div>
  );
}
