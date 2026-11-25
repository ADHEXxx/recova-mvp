import { AppNotification } from "@/types";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Bell, Boxes, Handshake, MessageSquare, Sparkles, TimerReset } from "lucide-react";

const ICONS: Record<AppNotification["type"], typeof Bell> = {
  match: Sparkles,
  grouping: Boxes,
  interest: Handshake,
  listing_expiring: TimerReset,
  message: MessageSquare,
  system: Bell,
};

export function NotificationCard({
  notification,
  onClick,
}: {
  notification: AppNotification;
  onClick?: () => void;
}) {
  const Icon = ICONS[notification.type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-border p-3.5 text-left transition-colors",
        notification.read ? "bg-card" : "bg-primary/[0.04]",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          notification.read ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeDate(notification.createdAt)}</p>
      </div>
    </button>
  );
}
