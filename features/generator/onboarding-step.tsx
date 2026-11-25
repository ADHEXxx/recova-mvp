import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiSelectChips } from "@/components/shared/multi-select-chips";
import { MATERIAL_TYPES } from "@/types";
import { GeneratorOnboardingForm } from "@/features/auth/types";

const FREQUENCIES = ["Única vez", "Semanal", "Quincenal", "Mensual", "Continua"] as const;
const AVAILABILITY = ["Inmediata", "En 3-7 días", "En 1-2 semanas"] as const;

export function GeneratorOnboardingStep({
  value,
  onChange,
}: {
  value: GeneratorOnboardingForm;
  onChange: (patch: Partial<GeneratorOnboardingForm>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tus materiales</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contale a EVA qué generás para empezar a encontrar oportunidades.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Materiales que generás</Label>
        <MultiSelectChips options={MATERIAL_TYPES} value={value.materials} onChange={(m) => onChange({ materials: m })} allowCustom />
        <p className="text-xs text-muted-foreground">¿No aparece? Escribilo y agregalo.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Frecuencia aproximada</Label>
          <Select value={value.frequency} onValueChange={(v) => onChange({ frequency: v as GeneratorOnboardingForm["frequency"] })}>
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
          <Label>Volumen promedio (kg)</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={value.avgVolume}
            onChange={(e) => onChange({ avgVolume: e.target.value })}
            placeholder="Ej. 500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Capacidad de almacenamiento (kg)</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={value.storageCapacity}
            onChange={(e) => onChange({ storageCapacity: e.target.value })}
            placeholder="Ej. 1000"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Disponibilidad</Label>
          <Select value={value.availability} onValueChange={(v) => onChange({ availability: v })}>
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

      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <ToggleRow
          label="¿Contás con transporte propio?"
          checked={value.hasTransport}
          onChange={(v) => onChange({ hasTransport: v })}
        />
        <ToggleRow
          label="¿Aceptás agrupación con otros generadores?"
          checked={value.acceptsGrouping}
          onChange={(v) => onChange({ acceptsGrouping: v })}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
