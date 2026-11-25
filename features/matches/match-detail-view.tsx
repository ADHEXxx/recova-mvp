"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { findEnrichedMatchByKey } from "@/services/matches";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CompatibilityScore } from "@/components/shared/compatibility-score";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, MapPin, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { formatKg, formatPriceRange } from "@/lib/format";
import { nextActionsFor } from "./match-actions";
import { toast } from "sonner";
import { CompanyAvatar } from "@/components/shared/company-avatar";

export function MatchDetailView({ matchKey: key }: { matchKey: string }) {
  const router = useRouter();
  const company = useCurrentCompany();
  const { state } = useStore();
  const { setMatchStatus, toggleSavedMatch, ensureConversation } = useStoreActions();

  const enriched = findEnrichedMatchByKey(state, key);
  if (!enriched || !company) return notFound();

  const { computed, status, saved } = enriched;
  const { material, requirement, generatorCompany, buyerCompany, score } = computed;
  const isParticipant = company.id === generatorCompany.id || company.id === buyerCompany.id;
  if (!isParticipant) return notFound();
  const isGenerator = company.role === "GENERATOR";
  const actions = nextActionsFor(status);

  function handleContact() {
    ensureConversation({
      id: `conv-${key}`,
      matchId: key,
      participantIds: [generatorCompany.id, buyerCompany.id],
      lastMessageAt: new Date().toISOString(),
    });
    router.push(`/messages?conversation=conv-${key}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Tu oportunidad" subtitle={`${material.materialType} · coincidencia detectada por EVA`} action={<StatusBadge status={status} />} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-semibold text-foreground">Conexión propuesta</p>
            <div className="mt-3 space-y-2">
              <CompanySide
                label={company.id === generatorCompany.id ? "Vos ofrecés" : "Ofrece el material"}
                name={generatorCompany.name}
                initials={generatorCompany.logoInitials}
                photoUrl={generatorCompany.contactPhotoUrl}
                highlight={isGenerator}
              />
              <div className="flex items-center gap-2 pl-4 text-sm font-medium text-primary">
                <ArrowDown className="h-4 w-4" />
                <span>puede abastecer a</span>
              </div>
              <CompanySide
                label={company.id === buyerCompany.id ? "Tu empresa necesita" : "Necesita el material"}
                name={buyerCompany.name}
                initials={buyerCompany.logoInitials}
                photoUrl={buyerCompany.contactPhotoUrl}
                highlight={!isGenerator}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Material" value={material.materialType} />
              <Stat label="Cantidad ofrecida" value={formatKg(material.quantity, material.unit)} />
              <Stat label="Cantidad solicitada" value={`${formatKg(requirement.minQuantity)}–${formatKg(requirement.idealQuantity)}`} />
              <Stat label="Distancia" value={`${score.distanceKm} km`} />
              <Stat label="Estado del material" value={material.cleanliness} />
              <Stat label="Entrega estimada" value={material.availability} />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {generatorCompany.city} → {buyerCompany.city}
            </div>

            <div className="mt-3 text-sm font-medium text-foreground">
              Valor estimado: {formatPriceRange(material.expectedPriceMin ?? 1, material.expectedPriceMax ?? 2)}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-accent" />
              <h3 className="text-sm font-semibold text-foreground">EVA recomienda este match</h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{score.reasoning}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="p-5">
            <CompatibilityScore overall={score.overall} breakdown={score.breakdown} />
          </Card>

          <Card className="space-y-2 p-4">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="w-full"
                onClick={() => {
                  setMatchStatus(key, action.next);
                  toast.success(`Estado actualizado: ${action.label}`);
                }}
              >
                {action.label}
              </Button>
            ))}

            {(status === "mutual_interest" || status === "negotiation" || status === "confirmed" || status === "completed") && (
              <Button variant="outline" className="w-full" onClick={handleContact}>
                Contactar
              </Button>
            )}

            <Button variant="ghost" className="w-full gap-2" onClick={() => toggleSavedMatch(key)}>
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Guardado" : "Guardar"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CompanySide({
  label,
  name,
  initials,
  photoUrl,
  highlight,
}: {
  label: string;
  name: string;
  initials: string;
  photoUrl?: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "rounded-lg bg-primary/[0.07] p-3" : "rounded-lg bg-secondary/70 p-3"}>
      <div className="flex items-center gap-3">
        <CompanyAvatar photoUrl={photoUrl} initials={initials} name={name} tone={highlight ? "primary" : "secondary"} size="lg" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-base font-semibold text-foreground">{name}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
