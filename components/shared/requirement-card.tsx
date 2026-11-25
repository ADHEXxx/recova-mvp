import Link from "next/link";
import { Requirement } from "@/types";
import { StatusBadge } from "./status-badge";
import { formatKg } from "@/lib/format";
import { ClipboardList, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RequirementCard({
  requirement,
  matchesCount,
  href,
}: {
  requirement: Requirement;
  matchesCount?: number;
  href?: string;
}) {
  const content = (
    <div className="flex gap-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
        <ClipboardList className="h-6 w-6 text-primary/60" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{requirement.materialType}</h3>
          <StatusBadge status={requirement.status} />
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{requirement.specifications}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatKg(requirement.minQuantity, requirement.unit)}
            {requirement.frequency !== "Única vez" ? ` / ${requirement.frequency.toLowerCase()}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {requirement.city}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      {href ? (
        <Link href={href} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
          {content}
        </Link>
      ) : (
        content
      )}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{matchesCount ?? 0}</span> matches
        </span>
        {href && (
          <Button asChild size="sm" variant="outline">
            <Link href={href}>Ver</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
