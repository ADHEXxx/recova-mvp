"use client";

import { useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, MapPin, Sparkles } from "lucide-react";
import { formatKg, formatDate } from "@/lib/format";
import { estimateMaterialValue } from "@/lib/eva/valuation";
import { findMatchesForMaterial } from "@/lib/eva/matching";
import { MatchCard } from "@/components/shared/match-card";
import { matchKey } from "@/lib/store";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MaterialDetailView({ materialId }: { materialId: string }) {
  const router = useRouter();
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateMaterial, addRequirement, setMatchStatus, ensureConversation } = useStoreActions();
  const [editOpen, setEditOpen] = useState(false);
  const [quantity, setQuantity] = useState("");

  const material = state.materials.find((m) => m.id === materialId);

  const networkMatches = useMemo(() => {
    if (!material) return [];
    return findMatchesForMaterial(material, state.requirements, state.companies).map((computed) => ({
      key: matchKey(computed.material.id, computed.requirement.id),
      computed,
      status: state.matchOverrides[matchKey(computed.material.id, computed.requirement.id)] ?? "available" as const,
      saved: state.savedMatchKeys.includes(matchKey(computed.material.id, computed.requirement.id)),
    }));
  }, [material, state.requirements, state.companies, state.matchOverrides, state.savedMatchKeys]);

  if (!material) return notFound();

  const isOwner = company?.id === material.companyId;
  const displayName = material.name.replace(/\s*—\s*primer lote$/i, " disponible");
  const matches = isOwner
    ? networkMatches
    : company?.role === "BUYER"
      ? networkMatches.filter((match) => match.computed.requirement.companyId === company.id)
      : [];
  const value = estimateMaterialValue(material, networkMatches.length);

  function contactForMaterial() {
    if (!company || company.role !== "BUYER") return;
    const selectedMaterial = material!;
    const existingRequirement = state.requirements.find(
      (requirement) => requirement.companyId === company.id && requirement.targetMaterialId === selectedMaterial.id,
    );
    const requirementId = existingRequirement?.id ?? `req-direct-${Date.now()}`;
    if (!existingRequirement) {
      addRequirement({
        id: requirementId,
        companyId: company.id,
        materialType: selectedMaterial.materialType,
        category: selectedMaterial.category,
        specifications: `Interés directo en la oferta: ${displayName}.`,
        minQuantity: selectedMaterial.quantity,
        idealQuantity: selectedMaterial.quantity,
        unit: selectedMaterial.unit,
        frequency: "Única vez",
        minQuality: selectedMaterial.cleanliness,
        city: company.city,
        radiusKm: 500,
        neededBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
        alternativeMaterials: [],
        status: "active",
        createdAt: new Date().toISOString(),
        targetMaterialId: selectedMaterial.id,
      });
    }
    const key = matchKey(selectedMaterial.id, requirementId);
    const conversationId = `conv-${key}`;
    setMatchStatus(key, "interest_sent");
    ensureConversation({
      id: conversationId,
      matchId: key,
      participantIds: [selectedMaterial.companyId, company.id],
      lastMessageAt: new Date().toISOString(),
    });
    toast.success("Interés enviado al proveedor");
    router.push(`/messages?conversation=${conversationId}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={displayName}
        subtitle={`${material.materialType} · oferta individual · ${formatDate(material.createdAt)}`}
        action={<StatusBadge status={material.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex gap-4">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: material.photos[0]?.color ?? "#eef1f2" }}
              >
                <Package className="h-8 w-8 text-primary/60" />
              </div>
              <div>
                <p className="text-sm text-foreground">{material.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {material.city}
                  </span>
                  <span>{material.condition}</span>
                  <span>{material.cleanliness}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Cantidad" value={formatKg(material.quantity, material.unit)} />
              <Stat label="Disponibilidad" value={material.availability} />
              <Stat label="Frecuencia" value={material.frequency} />
              <Stat label="Agrupación" value={material.acceptsGrouping ? "Sí" : "No"} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-accent" />
              <h3 className="text-sm font-semibold text-foreground">Estimación de valor de EVA</h3>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              Bs {value.minPrice.toFixed(2)}–{value.maxPrice.toFixed(2)}/{material.unit}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{value.explanation}</p>
            <p className="mt-2 text-xs italic text-muted-foreground">
              Valor orientativo — no es un precio garantizado.
            </p>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {isOwner ? `Empresas interesadas (${matches.length})` : `Compatibilidad con tus necesidades (${matches.length})`}
            </h3>
            {matches.length === 0 ? (
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {isOwner
                    ? "EVA todavía no encontró empresas compatibles."
                    : "Este material no coincide todavía con una necesidad publicada por tu empresa."}
                </p>
                {!isOwner && company?.role === "BUYER" && (
                  <Button type="button" className="mt-3 min-h-11 w-full" onClick={contactForMaterial}>
                    Me interesa este material
                  </Button>
                )}
                {!isOwner && company?.role === "BUYER" && (
                  <p className="mt-2 text-xs text-muted-foreground">Podés contactar al proveedor sin publicar una necesidad general.</p>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {matches.slice(0, 4).map((m) => (
                  <MatchCard key={m.key} match={m} perspective={isOwner ? "GENERATOR" : "BUYER"} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {isOwner ? (
            <Card className="space-y-2 p-4">
              <h3 className="text-sm font-semibold text-foreground">Gestionar publicación</h3>
              <Button className="w-full" variant="outline" onClick={() => { setQuantity(String(material.quantity)); setEditOpen(true); }}>
                Editar cantidad
              </Button>
              {material.status === "active" ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    updateMaterial(material.id, { status: "paused" });
                    toast.success("Material pausado");
                  }}
                >
                  Pausar publicación
                </Button>
              ) : material.status === "paused" ? (
                <Button
                  className="w-full"
                  onClick={() => {
                    updateMaterial(material.id, { status: "active" });
                    toast.success("Material reactivado");
                  }}
                >
                  Reactivar publicación
                </Button>
              ) : null}
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  updateMaterial(material.id, { status: "sold" });
                  toast.success("Marcado como vendido");
                  router.push("/materials");
                }}
              >
                Marcar como vendido
              </Button>
            </Card>
          ) : null}
        </div>
      </div>

      <ResponsiveDialog open={editOpen} onOpenChange={setEditOpen} title="Editar cantidad disponible">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cantidad ({material.unit})</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              updateMaterial(material.id, { quantity: Number(quantity) || material.quantity });
              toast.success("Cantidad actualizada");
              setEditOpen(false);
            }}
          >
            Guardar cambios
          </Button>
        </div>
      </ResponsiveDialog>
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
