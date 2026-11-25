import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { MATERIAL_TYPES } from "@/types";
import { BuyerOnboardingForm } from "@/features/auth/types";

const FREQUENCIES = ["Única vez", "Semanal", "Quincenal", "Mensual", "Continua"] as const;
const QUALITIES = ["Muy limpio", "Limpio", "Regular", "Con impurezas"] as const;
const AVAILABILITY = ["Inmediata", "En 3-7 días", "En 1-2 semanas"] as const;

export function BuyerOnboardingStep({
  value,
  onChange,
}: {
  value: BuyerOnboardingForm;
  onChange: (patch: Partial<BuyerOnboardingForm>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tus necesidades de abastecimiento</h1>
        <p className="mt-1 text-sm text-muted-foreground">EVA usará esto para encontrar generadores compatibles.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Materiales que utilizás</Label>
        <MultiSelectChips options={MATERIAL_TYPES} value={value.materials} onChange={(m) => onChange({ materials: m })} allowCustom />
      </div>

      <div className="space-y-1.5">
        <Label>Materiales alternativos aceptados</Label>
        <MultiSelectChips
          options={MATERIAL_TYPES}
          value={value.alternativeMaterials}
          onChange={(m) => onChange({ alternativeMaterials: m })}
          allowCustom
        />
      </div>

      <div className="space-y-1.5">
        <Label>Especificaciones técnicas</Label>
        <Textarea
          value={value.specifications}
          onChange={(e) => onChange({ specifications: e.target.value })}
          placeholder="Ej. sin PVC mezclado, humedad menor a 5%..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Volumen mínimo (kg)</Label>
          <Input type="number" inputMode="numeric" value={value.minVolume} onChange={(e) => onChange({ minVolume: e.target.value })} placeholder="Ej. 500" />
        </div>
        <div className="space-y-1.5">
          <Label>Volumen ideal (kg)</Label>
          <Input type="number" inputMode="numeric" value={value.idealVolume} onChange={(e) => onChange({ idealVolume: e.target.value })} placeholder="Ej. 1000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Frecuencia de compra</Label>
          <Select value={value.purchaseFrequency} onValueChange={(v) => onChange({ purchaseFrequency: v as BuyerOnboardingForm["purchaseFrequency"] })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Frecuencia" />
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
          <Select value={value.minQuality} onValueChange={(v) => onChange({ minQuality: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Calidad mínima" />
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
          <Label>Radio máximo de búsqueda (km)</Label>
          <Input type="number" inputMode="numeric" value={value.radiusKm} onChange={(e) => onChange({ radiusKm: e.target.value })} placeholder="Ej. 30" />
        </div>
        <div className="space-y-1.5">
          <Label>Disponibilidad deseada</Label>
          <Select value={value.desiredAvailability} onValueChange={(v) => onChange({ desiredAvailability: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Disponibilidad" />
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
    </div>
  );
}
