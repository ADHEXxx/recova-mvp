"use client";

import { useCurrentCompany, useStore } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { useRef, useState } from "react";
import { BadgeCheck, MapPin, Star, Truck, Boxes, Calendar, Camera, LoaderCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getOperationsForCompany } from "@/data/operations";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { Button } from "@/components/ui/button";
import { useStoreActions } from "@/lib/store";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

async function prepareProfilePhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Elegí una imagen JPG, PNG o WebP.");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("La foto debe pesar menos de 5 MB.");
  const image = await createImageBitmap(file);
  const side = Math.min(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo procesar la foto.");
  context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 512, 512);
  image.close();
  return canvas.toDataURL("image/webp", 0.82);
}

export function ProfileView() {
  const company = useCurrentCompany();
  const { state } = useStore();
  const { updateCompany } = useStoreActions();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  if (!company) return null;

  const materialsCount =
    company.role === "GENERATOR"
      ? state.materials.filter((m) => m.companyId === company.id).length
      : state.requirements.filter((r) => r.companyId === company.id).length;

  const operations = getOperationsForCompany(company.id);

  return (
    <div className="space-y-5">
      <PageHeader title="Tu perfil" subtitle="Así te ven las demás personas en Recova." />

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="relative">
              <CompanyAvatar photoUrl={company.contactPhotoUrl} initials={company.logoInitials} name={company.name} size="lg" className="h-20 w-20 text-xl" />
              <button type="button" onClick={() => photoInputRef.current?.click()} disabled={savingPhoto} aria-label="Cambiar foto de perfil" className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
                {savingPhoto ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setPhotoError("");
              setSavingPhoto(true);
              try {
                updateCompany(company.id, { contactPhotoUrl: await prepareProfilePhoto(file) });
              } catch (error) {
                setPhotoError(error instanceof Error ? error.message : "No se pudo guardar la foto.");
              } finally {
                setSavingPhoto(false);
              }
            }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{company.name}</h2>
              {company.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" /> Empresa verificada
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{company.materialUse ?? company.sector}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {company.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Miembro desde {formatDate(company.memberSince)}
              </span>
            </div>
            {company.bio && <p className="mt-3 text-sm text-foreground/90">{company.bio}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} disabled={savingPhoto}><Camera className="h-4 w-4" /> {company.contactPhotoUrl ? "Cambiar foto" : "Agregar foto"}</Button>
          {company.contactPhotoUrl && <Button type="button" variant="ghost" size="sm" onClick={() => updateCompany(company.id, { contactPhotoUrl: undefined })}><Trash2 className="h-4 w-4" /> Quitar</Button>}
          <span className="text-xs text-muted-foreground">JPG, PNG o WebP · máximo 5 MB</span>
        </div>
        {photoError && <p role="alert" className="mt-2 text-sm text-destructive">{photoError}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Star} label="Calificación" value={company.rating > 0 ? `${company.rating.toFixed(1)} / 5` : "Sin datos"} />
          <Stat icon={BadgeCheck} label="Cumplimiento" value={`${company.complianceRate}%`} />
          <Stat icon={Boxes} label="Operaciones" value={String(company.operationsCount)} />
          <Stat icon={Truck} label="Transporte propio" value={company.hasTransport ? "Sí" : "No"} />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {company.role === "GENERATOR" ? "Materiales publicados" : "Necesidades publicadas"}
          </h3>
          <p className="mt-1 text-2xl font-bold text-primary">{materialsCount}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground">Operaciones registradas</h3>
          <p className="mt-1 text-2xl font-bold text-primary">{operations.length}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground">Reputación</h3>
        <div className="mt-3 space-y-3">
          <ReputationBar label="Cumplimiento de cantidad" value={company.complianceRate} />
          <ReputationBar label="Cumplimiento de calidad" value={company.qualityComplianceRate} />
          <ReputationBar label="Puntualidad" value={company.punctualityRate} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReputationBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-success" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
