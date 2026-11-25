"use client";

import { useCurrentCompany } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { GeneratorEvaView } from "@/features/eva/generator-eva-view";
import { BuyerEvaView } from "@/features/eva/buyer-eva-view";
import { AskEvaPanel } from "@/features/eva/ask-eva-panel";
import { EvaAvatar } from "@/components/shared/eva-avatar";

export default function EvaPage() {
  const company = useCurrentCompany();
  if (!company) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="EVA"
        subtitle="Evaluación y Valorización Automatizada."
        leading={<EvaAvatar size="lg" priority />}
        action={<AskEvaPanel role={company.role} />}
      />
      <p className="-mt-4 max-w-2xl text-sm text-muted-foreground">
        Analizamos materiales, demanda y oportunidades para ayudarte a tomar mejores decisiones.
      </p>

      {company.role === "GENERATOR" ? (
        <GeneratorEvaView company={company} />
      ) : (
        <BuyerEvaView company={company} />
      )}
    </div>
  );
}
