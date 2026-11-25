import { PageHeader } from "@/components/shared/page-header";
import { MaterialForm } from "@/features/materials/material-form";

export function NewMaterialView({ requirementId }: { requirementId?: string }) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader
        title={requirementId ? "Ofrecer material" : "Publicar material"}
        subtitle={requirementId ? "Creá una oferta puntual para esta solicitud." : "EVA te va a ayudar a clasificarlo y encontrar oportunidades."}
      />
      <MaterialForm requirementId={requirementId} />
    </div>
  );
}
