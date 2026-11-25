import Link from "next/link";
import { Company, Material } from "@/types";
import { StatusBadge } from "./status-badge";
import { formatKg, formatRelativeDate } from "@/lib/format";
import { BadgeCheck, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyAvatar } from "./company-avatar";

export function MaterialCard({
  material,
  matchesCount,
  href,
  footer,
  seller,
}: {
  material: Material;
  matchesCount?: number;
  href?: string;
  footer?: React.ReactNode;
  seller?: Company;
}) {
  const displayName = material.name.replace(/\s*—\s*primer lote$/i, " disponible");
  const offerContent = seller ? (
    <div>
      <div className="flex items-center gap-3">
        <CompanyAvatar photoUrl={seller.contactPhotoUrl} initials={seller.logoInitials} name={seller.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-foreground">{seller.name}</h3>
            {seller.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Perfil verificado" />}
          </div>
          <p className="text-sm text-muted-foreground">{seller.accountType === "INDIVIDUAL" ? "Recolector independiente" : "Proveedor"}</p>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-secondary p-3">
        <p className="text-xs text-muted-foreground">Ofrece</p>
        <p className="mt-1 text-base font-semibold text-foreground">{material.materialType}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatKg(material.quantity, material.unit)}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {material.city}</span>
          <span>{formatRelativeDate(material.createdAt)}</span>
        </div>
      </div>
    </div>
  ) : null;
  const content = (
    <div className="flex gap-3">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border"
        style={{ backgroundColor: material.photos[0]?.color ?? "#eef1f2" }}
      >
        <Package className="h-6 w-6 text-primary/60" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{displayName}</h3>
          <StatusBadge status={material.status} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{material.materialType}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{formatKg(material.quantity, material.unit)}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {material.city}
          </span>
          <span>{formatRelativeDate(material.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <article className="rounded-xl border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md">
      {href ? (
        <Link href={href} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
          {offerContent ?? content}
        </Link>
      ) : (
        offerContent ?? content
      )}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        {seller ? (
          <span className="text-sm text-muted-foreground">Calidad: <span className="font-medium text-foreground">{material.cleanliness}</span></span>
        ) : typeof matchesCount === "number" ? (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{matchesCount}</span> matches encontrados
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{material.cleanliness}</span>
        )}
        {footer ?? (
          href && (
            <Button asChild size="sm" variant="outline">
              <Link href={href}>{seller ? "Ver oferta" : "Ver"}</Link>
            </Button>
          )
        )}
      </div>
    </article>
  );
}
