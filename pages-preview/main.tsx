import { Component, type ComponentType, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import DashboardPage from "@/app/(app)/dashboard/page";
import MarketplacePage from "@/app/(app)/marketplace/page";
import MaterialsPage from "@/app/(app)/materials/page";
import RequirementsPage from "@/app/(app)/requirements/page";
import NewRequirementPage from "@/app/(app)/requirements/new/page";
import MatchesPage from "@/app/(app)/matches/page";
import EvaPage from "@/app/(app)/eva/page";
import HistoryPage from "@/app/(app)/history/page";
import MessagesPage from "@/app/(app)/messages/page";
import NotificationsPage from "@/app/(app)/notifications/page";
import ProfilePage from "@/app/(app)/profile/page";
import SettingsPage from "@/app/(app)/settings/page";
import ComparePage from "@/app/(app)/compare/page";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { GroupingDetailView } from "@/features/grouping/grouping-detail-view";
import { MaterialDetailView } from "@/features/materials/material-detail-view";
import { NewMaterialView } from "@/features/materials/new-material-view";
import { MatchDetailView } from "@/features/matches/match-detail-view";
import { RequirementDetailView } from "@/features/requirements/requirement-detail-view";
import { StoreProvider } from "@/lib/store";
import { PageNotFound, useLocation, usePathname, useSearchParams } from "./navigation";
import "./fonts.css";

const staticPages: Partial<Record<string, ComponentType>> = {
  "/dashboard": DashboardPage,
  "/marketplace": MarketplacePage,
  "/materials": MaterialsPage,
  "/requirements": RequirementsPage,
  "/requirements/new": NewRequirementPage,
  "/matches": MatchesPage,
  "/eva": EvaPage,
  "/history": HistoryPage,
  "/messages": MessagesPage,
  "/notifications": NotificationsPage,
  "/profile": ProfilePage,
  "/settings": SettingsPage,
  "/compare": ComparePage,
};

function MissingPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <a href="#/dashboard" className="mt-4 inline-block text-primary underline">Volver a Inicio</a>
    </main>
  );
}

class RouteBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error instanceof PageNotFound) return <MissingPage />;
    if (this.state.error) throw this.state.error;
    return this.props.children;
  }
}

function AppRoute() {
  const pathname = usePathname();
  const query = useSearchParams();
  const Page = staticPages[pathname];
  if (Page) return <Page />;
  if (pathname === "/materials/new") return <NewMaterialView requirementId={query.get("requirement") ?? undefined} />;

  const [, section, id, extra] = pathname.split("/");
  if (!id || extra) return <MissingPage />;
  switch (section) {
    case "materials": return <MaterialDetailView materialId={id} />;
    case "requirements": return <RequirementDetailView requirementId={id} />;
    case "matches": return <MatchDetailView matchKey={id} />;
    case "grouping": return <GroupingDetailView lotId={id} />;
    default: return <MissingPage />;
  }
}

function Preview() {
  const pathname = usePathname();
  const location = useLocation();
  if (pathname === "/") return <HomePage />;
  if (pathname === "/login") return <LoginPage />;
  if (pathname === "/register") return <RegisterPage />;

  return <AppShell><RouteBoundary key={location}><AppRoute /></RouteBoundary></AppShell>;
}

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <TooltipProvider delayDuration={200}>
      <Preview />
      <Toaster position="top-center" />
    </TooltipProvider>
  </StoreProvider>,
);
