import { Company } from "@/types";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";

export function CompanyCard({ company, className }: { company: Company; className?: string }) {
  return (
    <div className={cn("flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-[border-color,background-color]", className)}>
      <CompanyAvatar photoUrl={company.contactPhotoUrl} initials={company.logoInitials} name={company.name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
          {company.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {company.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" /> {company.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
