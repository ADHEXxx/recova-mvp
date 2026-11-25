"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { buildGroupedLot } from "@/lib/eva/grouping";
import { getCompanyById } from "@/data/companies";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKg } from "@/lib/format";
import { Boxes, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function GroupingDetailView({ lotId }: { lotId: string }) {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateMaterial } = useStoreActions();

  const requirementId = lotId.replace(/^grp-/, "");
  const requirement = state.requirements.find((r) => r.id === requirementId);
  if (!requirement) return notFound();

  const lot = buildGroupedLot(requirement, state.materials, undefined, state.companies);
  if (!lot) return notFound();

  const buyerCompany = state.companies.find((item) => item.id === requirement.companyId) ?? getCompanyById(requirement.companyId);
  const percent = Math.min(100, Math.round((lot.totalQuantity / lot.minRequired) * 100));

  const myEligibleMaterial =
    company?.role === "GENERATOR"
      ? state.materials.find(
          (m) =>
            m.companyId === company.id &&
            m.status === "active" &&
            m.acceptsGrouping &&
            (m.materialType === requirement.materialType || requirement.alternativeMaterials.includes(m.materialType)),
        )
      : null;

  const alreadyMember = myEligibleMaterial ? lot.members.some((m) => m.materialId === myEligibleMaterial.id) : false;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Agrupación de ${lot.materialType}`}
        subtitle={buyerCompany ? `Para abastecer a ${buyerCompany.name}` : undefined}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand-accent" />
            <h3 className="text-sm font-semibold text-foreground">Composición del lote</h3>
          </div>

          <div className="mt-4 grid gap-2 min-[380px]:grid-cols-3">
            {lot.members.map((member) => {
              const memberCompany = state.companies.find((item) => item.id === member.companyId) ?? getCompanyById(member.companyId);
              const isYou = member.companyId === company?.id;
              const barPercent = Math.round((member.quantity / lot.totalQuantity) * 100);
              return (
                <div key={member.materialId} className="rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground">{isYou ? "Tu lote" : memberCompany?.name ?? "Generador"}</p>
                    <p className="mt-1 font-bold text-foreground">{formatKg(member.quantity)}</p>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${barPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl bg-primary p-4 text-primary-foreground">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Total agrupado</span>
              <span className="text-2xl font-bold">{formatKg(lot.totalQuantity)}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs">
              Empresa usuaria requiere mínimo {formatKg(lot.minRequired)} — {percent}% cubierto
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/[0.05] p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
            <p className="text-sm text-foreground/90">
              {lot.totalQuantity >= lot.minRequired
                ? "EVA: Esta agrupación supera el volumen mínimo requerido."
                : "EVA: A esta agrupación todavía le falta volumen para alcanzar el mínimo requerido."}
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground">Requerimiento</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Material" value={requirement.materialType} />
              <Row label="Calidad mínima" value={requirement.minQuality} />
              <Row label="Ciudad" value={requirement.city} />
              <Row label="Radio" value={`${requirement.radiusKm} km`} />
            </dl>
          </Card>

          {company?.role === "GENERATOR" && myEligibleMaterial && !alreadyMember && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                updateMaterial(myEligibleMaterial.id, { status: "grouped" });
                toast.success("Te uniste al lote agrupado");
              }}
            >
              Unirme al lote
            </Button>
          )}
          {company?.role === "GENERATOR" && alreadyMember && (
            <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
              Ya formás parte de este lote
            </div>
          )}
          {company?.role === "BUYER" && (
            <Button className="w-full" size="lg" asChild>
              <Link href="/messages">Contactar generadores</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
