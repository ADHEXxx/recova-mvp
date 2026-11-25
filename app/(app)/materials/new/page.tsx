import { NewMaterialView } from "@/features/materials/new-material-view";

export default async function NewMaterialPage({ searchParams }: PageProps<"/materials/new">) {
  const params = await searchParams;
  const requirementId = typeof params.requirement === "string" ? params.requirement : undefined;
  return <NewMaterialView requirementId={requirementId} simulateQr={params.scan === "qr"} />;
}
