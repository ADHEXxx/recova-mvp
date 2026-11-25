"use client";

import Link from "next/link";
import { ClipboardList, Handshake, Package, Plus, Sparkles } from "lucide-react";
import { EvaAvatar } from "@/components/shared/eva-avatar";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { MatchCard } from "@/components/shared/match-card";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { featuredCompanyIds } from "@/data/companies";
import { useCurrentCompany, useStore } from "@/lib/store";
import { getMatchesForCompany } from "@/services/matches";

export default function DashboardPage() {
  const { state } = useStore();
  const company = useCurrentCompany();
  if (!company) return null;

  const isGenerator = company.role === "GENERATOR";
  const listings = isGenerator ? state.materials : state.requirements;
  const active = listings.filter((item) => item.companyId === company.id && item.status === "active").length;
  const opportunities = getMatchesForCompany(state, company).filter(({ status }) => !["cancelled", "completed"].includes(status));
  const featuredCompanies = state.companies.filter((item) => featuredCompanyIds.has(item.id));

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{isGenerator ? "Generador" : "Comprador industrial"}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{company.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{company.city}</p>
        </div>
        <Link href="/eva" aria-label="Abrir EVA" className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"><EvaAvatar size="lg" /></Link>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label={isGenerator ? "Materiales activos" : "Necesidades activas"} value={String(active)} icon={isGenerator ? Package : ClipboardList} />
        <MetricCard label="Oportunidades EVA" value={String(opportunities.length)} icon={Handshake} accent="accent" />
      </div>

      <Button asChild className="w-full rounded-xl sm:w-auto">
        <Link href={isGenerator ? "/materials/new" : "/requirements/new"}><Plus />{isGenerator ? "Publicar material" : "Publicar necesidad"}</Link>
      </Button>

      <section aria-labelledby="example-companies" className="rounded-xl border border-border bg-card p-4">
        <h2 id="example-companies" className="font-semibold">Empresas del ejemplo</h2>
        <ul className="mt-3 grid gap-2 min-[360px]:grid-cols-2 lg:grid-cols-3">
          {featuredCompanies.map((item) => (
            <li key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-secondary-foreground">
              <CompanyAvatar initials={item.logoInitials} size="sm" tone="secondary" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.city} · {item.role === "GENERATOR" ? "Generador" : "Comprador"}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="opportunities" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="opportunities" className="font-semibold">Oportunidades recomendadas</h2>
          <Button asChild variant="ghost"><Link href="/eva"><Sparkles /> Abrir EVA</Link></Button>
        </div>
        {opportunities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {opportunities.slice(0, 2).map((match) => <MatchCard key={match.key} match={match} perspective={company.role} />)}
          </div>
        ) : <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">EVA aún no encontró oportunidades para tus publicaciones.</p>}
      </section>
    </div>
  );
}
