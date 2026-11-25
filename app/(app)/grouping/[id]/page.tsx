import { GroupingDetailView } from "@/features/grouping/grouping-detail-view";

export default async function GroupingDetailPage({ params }: PageProps<"/grouping/[id]">) {
  const { id } = await params;
  return <GroupingDetailView lotId={id} />;
}
