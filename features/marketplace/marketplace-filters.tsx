import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES, MATERIAL_CATEGORIES, MATERIAL_TYPES } from "@/types";

export interface MarketplaceFiltersState {
  materialType: string;
  category: string;
  city: string;
  availability: string;
  cleanliness: string;
}

export const defaultMarketplaceFilters: MarketplaceFiltersState = {
  materialType: "all",
  category: "all",
  city: "all",
  availability: "all",
  cleanliness: "all",
};

export function countActiveFilters(f: MarketplaceFiltersState, mode: "materials" | "requirements" = "materials") {
  return Object.entries(f).filter(([key, value]) => value !== "all" && (mode === "materials" || key !== "availability")).length;
}

export function MarketplaceFilterForm({
  mode = "materials",
  value,
  onChange,
}: {
  mode?: "materials" | "requirements";
  value: MarketplaceFiltersState;
  onChange: (patch: Partial<MarketplaceFiltersState>) => void;
}) {
  return (
    <div className="space-y-4">
      <FilterField label="Tipo de material">
        <Select value={value.materialType} onValueChange={(v) => onChange({ materialType: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {MATERIAL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Categoría">
        <Select value={value.category} onValueChange={(v) => onChange({ category: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {MATERIAL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Ciudad">
        <Select value={value.city} onValueChange={(v) => onChange({ city: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      {mode === "materials" && (
        <FilterField label="Disponibilidad">
          <Select value={value.availability} onValueChange={(v) => onChange({ availability: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquiera</SelectItem>
              <SelectItem value="Inmediata">Inmediata</SelectItem>
              <SelectItem value="En 3-7 días">En 3-7 días</SelectItem>
              <SelectItem value="En 1-2 semanas">En 1-2 semanas</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      )}

      <FilterField label={mode === "materials" ? "Calidad mínima" : "Calidad solicitada"}>
        <Select value={value.cleanliness} onValueChange={(v) => onChange({ cleanliness: v })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquiera</SelectItem>
            <SelectItem value="Muy limpio">Muy limpio</SelectItem>
            <SelectItem value="Limpio">Limpio</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
            <SelectItem value="Con impurezas">Con impurezas</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
