"use client";

import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationCard } from "@/components/shared/notification-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { markNotificationRead, markAllNotificationsRead } = useStoreActions();
  const router = useRouter();

  if (!company) return null;

  const items = state.notifications
    .filter((n) => n.companyId === company.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notificaciones"
        subtitle="Novedades sobre tus materiales, necesidades y matches."
        action={
          unreadCount > 0 ? (
            <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
              Marcar todo como leído
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No tenés notificaciones" description="Te avisaremos apenas EVA encuentre novedades para vos." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.link) router.push(n.link as never);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
