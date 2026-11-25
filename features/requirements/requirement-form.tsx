"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CITIES, MaterialCategory, MaterialType, MATERIAL_TYPES, Requirement } from "@/types";
import { categoryForMaterialType } from "@/lib/material-category";
import { useCurrentCompany, useStoreActions } from "@/lib/store";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";

const QUALITIES = ["Muy limpio", "Limpio", "Regular", "Con impurezas"] as const;
const FREQUENCIES = ["Única vez", "Semanal", "Quincenal", "Mensual", "Continua"] as const;

export function RequirementForm() {
  const router = useRouter();
  const company = useCurrentCompany();
  const { addRequirement } = useStoreActions();

  const [materialType, setMaterialType] = useState<MaterialType | "">("");
  const [specifications, setSpecifications] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [idealQuantity, setIdealQuantity] = useState("");
  const [frequency, setFrequency] = useState<Requirement["frequency"] | "">("");
  const [minQuality, setMinQuality] = useState<Requirement["minQuality"] | "">("");
  const [city, setCity] = useState(company?.city ?? "");
  const [radiusKm, setRadiusKm] = useState("30");
  const [neededBy, setNeededBy] = useState("");
  const [alternativeMaterials, setAlternativeMaterials] = useState<MaterialType[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    if (!materialType || !minQuantity || !idealQuantity || !frequency || !minQuality || !city) {
      toast.error("Completá los campos obligatorios.");
      return;
    }

    const requirement: Requirement = {
      id: `req-${Date.now()}`,
      companyId: company.id,
      materialType,
      category: categoryForMaterialType(materialType) as MaterialCategory,
      specifications: specifications || "Sin especificaciones adicionales.",
      minQuantity: Number(minQuantity),
      idealQuantity: Number(idealQuantity),
      unit: "kg",
      frequency,
      minQuality,
      city: city as Requirement["city"],
      radiusKm: Number(radiusKm) || 30,
      neededBy: neededBy ? new Date(neededBy).toISOString() : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      alternativeMaterials,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    addRequirement(requirement);
    toast.success("EVA está buscando oportunidades.");
    router.push("/requirements");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      <div className="space-y-1.5">
        <Label>Material requerido</Label>
        <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            {MATERIAL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Especificaciones técnicas</Label>
        <Textarea
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          placeholder="Ej. sin PVC mezclado, humedad menor a 5%..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Cantidad mínima (kg)</Label>
          <Input type="number" inputMode="numeric" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="Ej. 500" />
        </div>
        <div className="space-y-1.5">
          <Label>Cantidad ideal (kg)</Label>
          <Input type="number" inputMode="numeric" value={idealQuantity} onChange={(e) => setIdealQuantity(e.target.value)} placeholder="Ej. 1000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Frecuencia</Label>
          <Select value={frequency} onValueChange={(v) => setFrequency(v as Requirement["frequency"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Calidad mínima</Label>
          <Select value={minQuality} onValueChange={(v) => setMinQuality(v as Requirement["minQuality"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {QUALITIES.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ciudad</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Radio máximo (km)</Label>
          <Input type="number" inputMode="numeric" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Fecha requerida</Label>
        <Input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Materiales alternativos aceptados</Label>
        <MultiSelectChips options={MATERIAL_TYPES} value={alternativeMaterials} onChange={setAlternativeMaterials} />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Crear necesidad
      </Button>
    </form>
  );
}
