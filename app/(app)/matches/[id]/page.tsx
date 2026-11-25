import { MatchDetailView } from "@/features/matches/match-detail-view";

export default async function MatchDetailPage({ params }: PageProps<"/matches/[id]">) {
  const { id } = await params;
  return <MatchDetailView matchKey={id} />;
}
