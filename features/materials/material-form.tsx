"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CITIES, MATERIAL_CATEGORIES, MaterialCategory, MaterialType, MATERIAL_TYPES } from "@/types";
import { classifyMaterial } from "@/lib/eva/classify";
import { categoryForMaterialType } from "@/lib/material-category";
import { useCurrentCompany, useStore, useStoreActions } from "@/lib/store";
import { ClipboardCheck, QrCode, Sparkles } from "lucide-react";
import { Material } from "@/types";
import { MATERIAL_QR_SAMPLE } from "@/data/sample-qr";

const CONDITIONS = ["Nuevo excedente", "Usado - buen estado", "Usado - reciclable", "Procesado"] as const;
const CLEANLINESS = ["Muy limpio", "Limpio", "Regular", "Con impurezas"] as const;
const AVAILABILITY = ["Inmediata", "En 3-7 días", "En 1-2 semanas"] as const;
const FREQUENCIES = ["Única vez", "Semanal", "Quincenal", "Mensual", "Continua"] as const;

export function MaterialForm({ requirementId, simulateQr }: { requirementId?: string; simulateQr?: boolean }) {
  const router = useRouter();
  const company = useCurrentCompany();
  const { state } = useStore();
  const { addMaterial } = useStoreActions();
  const linkedRequirement = requirementId ? state.requirements.find((requirement) => requirement.id === requirementId) : undefined;
  const didPrefill = useRef(false);

  const sample = simulateQr && !requirementId && company?.role === "GENERATOR" ? MATERIAL_QR_SAMPLE : undefined;
  const [description, setDescription] = useState<string>(sample?.description ?? "");
  const [name, setName] = useState<string>(sample?.name ?? "");
  const [category, setCategory] = useState<MaterialCategory | "">(sample ? categoryForMaterialType(sample.materialType) : "");
  const [materialType, setMaterialType] = useState<MaterialType | "">(sample?.materialType ?? "");
  const [quantity, setQuantity] = useState<string>(sample?.quantity ?? "");
  const [unit, setUnit] = useState<Material["unit"]>("kg");
  const [condition, setCondition] = useState<Material["condition"] | "">(sample?.condition ?? "");
  const [cleanliness, setCleanliness] = useState<Material["cleanliness"] | "">(sample?.cleanliness ?? "");
  const [humidity, setHumidity] = useState("");
  const [city, setCity] = useState(company?.city ?? "");
  const [availability, setAvailability] = useState<Material["availability"] | "">(sample?.availability ?? "");
  const [frequency, setFrequency] = useState<Material["frequency"] | "">(sample?.frequency ?? "");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [acceptsGrouping, setAcceptsGrouping] = useState(true);
  const [suggestionUsed, setSuggestionUsed] = useState(false);

  useEffect(() => {
    if (!linkedRequirement || didPrefill.current) return;
    didPrefill.current = true;
    setName(`Oferta puntual de ${linkedRequirement.materialType}`);
    setMaterialType(linkedRequirement.materialType);
    setCategory(linkedRequirement.category);
    setUnit(linkedRequirement.unit);
    setCity(company?.city ?? linkedRequirement.city);
    setFrequency("Única vez");
    setAcceptsGrouping(true);
  }, [company?.city, linkedRequirement]);

  const suggestion = useMemo(() => {
    if (description.trim().length < 6) return null;
    return classifyMaterial(description, category || undefined);
  }, [description, category]);

  function applySuggestion() {
    if (!suggestion) return;
    setMaterialType(suggestion.material);
    setCategory(categoryForMaterialType(suggestion.material));
    setSuggestionUsed(true);
    toast.success(`EVA clasificó el material como ${suggestion.material}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    if (!name || !materialType || !category || !quantity || !condition || !cleanliness || !city || !availability || !frequency) {
      toast.error("Completá los campos obligatorios.");
      return;
    }

    const material: Material = {
      id: `mat-${Date.now()}`,
      companyId: company.id,
      name,
      materialType,
      category,
      description: description || name,
      quantity: Number(quantity),
      unit,
      condition,
      cleanliness,
      humidity: humidity ? Number(humidity) : undefined,
      city: city as Material["city"],
      availability,
      frequency,
      photos: [{ id: "p1", color: "#e8ecef" }],
      expectedPriceMin: priceMin ? Number(priceMin) : undefined,
      expectedPriceMax: priceMax ? Number(priceMax) : undefined,
      acceptsGrouping,
      status: "active",
      createdAt: new Date().toISOString(),
      aiClassification: suggestion ? { suggested: suggestion.material, confidence: suggestion.confidence } : undefined,
    };

    addMaterial(material);
    toast.success(linkedRequirement ? "Oferta enviada. EVA está verificando la compatibilidad." : "Material publicado. EVA ya está buscando oportunidades.");
    router.push(linkedRequirement ? `/requirements/${linkedRequirement.id}` : "/materials");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {sample && (
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-4" role="status">
          <QrCode aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">QR simulado · {sample.code}</p>
            <p className="mt-1 text-sm text-muted-foreground">Revisá y editá los datos del lote antes de publicarlo.</p>
          </div>
        </div>
      )}
      {linkedRequirement && (
        <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Oferta para una solicitud activa</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Buscan {linkedRequirement.materialType}: entre {linkedRequirement.minQuantity} y {linkedRequirement.idealQuantity} {linkedRequirement.unit}. Podés ofrecer la cantidad que conseguiste, aunque sea por única vez.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Descripción del material</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Recortes transparentes de botellas..."
          rows={3}
        />
        {suggestion && (
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/[0.05] px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
              EVA cree que puede ser <strong>{suggestion.material}</strong> ({suggestion.confidence}%)
            </span>
            {!suggestionUsed && (
              <Button type="button" size="sm" variant="outline" onClick={applySuggestion}>
                Usar sugerencia
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nombre de la publicación</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. HDPE limpio en recortes" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Material</Label>
          <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {linkedRequirement && !MATERIAL_TYPES.includes(linkedRequirement.materialType as (typeof MATERIAL_TYPES)[number]) && (
                <SelectItem value={linkedRequirement.materialType}>{linkedRequirement.materialType}</SelectItem>
              )}
              {MATERIAL_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as MaterialCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Cantidad</Label>
          <Input type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ej. 500" />
        </div>
        <div className="space-y-1.5">
          <Label>Unidad</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as Material["unit"])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="ton">ton</SelectItem>
              <SelectItem value="unidades">unidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Estado del material</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Material["condition"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Limpieza</Label>
          <Select value={cleanliness} onValueChange={(v) => setCleanliness(v as Material["cleanliness"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {CLEANLINESS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Humedad % (opcional)</Label>
        <Input type="number" inputMode="numeric" value={humidity} onChange={(e) => setHumidity(e.target.value)} placeholder="Ej. 4" />
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
          <Label>Disponibilidad</Label>
          <Select value={availability} onValueChange={(v) => setAvailability(v as Material["availability"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Frecuencia</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency(v as Material["frequency"])}>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Precio esperado mín. (opcional)</Label>
          <Input type="number" inputMode="decimal" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Bs/kg" />
        </div>
        <div className="space-y-1.5">
          <Label>Precio esperado máx. (opcional)</Label>
          <Input type="number" inputMode="decimal" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Bs/kg" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="text-sm text-foreground">¿Aceptás agrupación con otros generadores?</span>
        <Switch checked={acceptsGrouping} onCheckedChange={setAcceptsGrouping} />
      </div>

      <Button type="submit" size="lg" className="w-full">
        {linkedRequirement ? "Enviar oferta" : "Publicar material"}
      </Button>
    </form>
  );
}
