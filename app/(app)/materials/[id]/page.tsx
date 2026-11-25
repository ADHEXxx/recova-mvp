import { MaterialDetailView } from "@/features/materials/material-detail-view";

export default async function MaterialDetailPage({ params }: PageProps<"/materials/[id]">) {
  const { id } = await params;
  return <MaterialDetailView materialId={id} />;
}
