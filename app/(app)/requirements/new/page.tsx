import { PageHeader } from "@/components/shared/page-header";
import { RequirementForm } from "@/features/requirements/requirement-form";

export default function NewRequirementPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader title="Crear necesidad" subtitle="EVA va a buscar generadores compatibles con esta necesidad." />
      <RequirementForm />
    </div>
  );
}
