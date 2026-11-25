import { PageHeader } from "@/components/shared/page-header";
import { MaterialForm } from "@/features/materials/material-form";

export default async function NewMaterialPage({ searchParams }: PageProps<"/materials/new">) {
  const params = await searchParams;
  const requirementId = typeof params.requirement === "string" ? params.requirement : undefined;
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
