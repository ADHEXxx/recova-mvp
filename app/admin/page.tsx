import { PageHeader } from "@/components/shared/page-header";
import { AdminView } from "@/features/admin/admin-view";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Administración" subtitle="Visión general de la actividad en Recova." />
      <AdminView />
    </div>
  );
}
