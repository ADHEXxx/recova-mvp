import { RequirementDetailView } from "@/features/requirements/requirement-detail-view";

export default async function RequirementDetailPage({ params }: PageProps<"/requirements/[id]">) {
  const { id } = await params;
  return <RequirementDetailView requirementId={id} />;
}
