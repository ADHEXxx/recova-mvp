import { Building2, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/types";
import { cn } from "@/lib/utils";
import { CompanyBasicsForm } from "./types";
import { MaterialUse, Role } from "@/types";

const SECTORS = [
  "Plásticos y empaques",
  "Metalmecánica",
  "Papel y cartón",
  "Madera y forestal",
  "Logística y distribución",
  "Reciclaje y gestión de residuos",
  "Construcción",
  "Textil",
  "Alimentos y bebidas",
] as const;

const MATERIAL_USES: { value: MaterialUse; description: string }[] = [
  { value: "Usarlos en producción", description: "Como materia prima o insumo en un proceso" },
  { value: "Reciclarlos o transformarlos", description: "Procesarlos para obtener un nuevo material" },
  { value: "Acopiarlos y clasificarlos", description: "Reunir, separar o consolidar volúmenes" },
  { value: "Comercializarlos o exportarlos", description: "Comprar para vender dentro o fuera del país" },
  { value: "Otro uso", description: "Una actividad diferente a las anteriores" },
];

export function CompanyBasicsStep({ role, value, onChange }: { role: Role | null; value: CompanyBasicsForm; onChange: (patch: Partial<CompanyBasicsForm>) => void }) {
  const isIndividual = value.accountType === "INDIVIDUAL";
  const isCompany = value.accountType === "COMPANY";
  const isBuyer = role === "BUYER";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isBuyer ? "Datos de la empresa" : "¿Cómo trabajás?"}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {isBuyer
            ? "Estos datos identifican a la organización que comprará o utilizará los materiales."
            : "Podés registrarte como recolector independiente o como organización."}
        </p>
      </div>

      {!isBuyer && (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Tipo de perfil">
          <ProfileTypeButton active={isIndividual} icon={UserRound} title="Independiente" description="Recolecto por cuenta propia" onClick={() => onChange({ accountType: "INDIVIDUAL" })} />
          <ProfileTypeButton active={isCompany} icon={Building2} title="Organización" description="Empresa, asociación o centro" onClick={() => onChange({ accountType: "COMPANY" })} />
        </div>
      )}

      {value.accountType && (
        <div className="space-y-5">
          <Field label={isIndividual ? "Tu nombre" : isBuyer ? "Razón social o nombre comercial" : "Nombre de la organización"} htmlFor="profile-name">
            <Input id="profile-name" value={value.name} onChange={(e) => onChange({ name: e.target.value })} placeholder={isIndividual ? "Ej. Carlos Mendoza" : "Ej. Matriplast"} autoComplete={isIndividual ? "name" : "organization"} />
          </Field>

          {isCompany && !isBuyer && (
            <Field label="Sector" htmlFor="profile-sector">
              <Select value={value.sector} onValueChange={(sector) => onChange({ sector: sector as CompanyBasicsForm["sector"] })}>
                <SelectTrigger id="profile-sector" className="w-full"><SelectValue placeholder="Seleccioná un sector" /></SelectTrigger>
                <SelectContent>{SECTORS.map((sector) => <SelectItem key={sector} value={sector}>{sector}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}

          {isBuyer && (
            <Field label="¿Qué hará la empresa con los materiales?" htmlFor="profile-material-use">
              <Select value={value.materialUse} onValueChange={(materialUse) => onChange({ materialUse: materialUse as MaterialUse })}>
                <SelectTrigger id="profile-material-use" className="h-auto min-h-11 w-full py-2">
                  <SelectValue placeholder="Seleccioná la actividad principal" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_USES.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-3">
                      <span className="flex flex-col items-start">
                        <span>{option.value}</span>
                        <span className="text-xs font-normal text-muted-foreground">{option.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <div className={cn("grid gap-5", isCompany && "sm:grid-cols-2 sm:gap-3")}>
            <Field label="Ciudad" htmlFor="profile-city">
              <Select value={value.city} onValueChange={(city) => onChange({ city: city as CompanyBasicsForm["city"] })}>
                <SelectTrigger id="profile-city" className="w-full"><SelectValue placeholder="Seleccioná tu ciudad" /></SelectTrigger>
                <SelectContent>{CITIES.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Teléfono" htmlFor="profile-phone" optional>
              <div className="flex rounded-lg border border-input bg-card transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                <span className="flex h-11 items-center border-r border-border px-3 text-sm font-semibold text-foreground">+591</span>
                <Input id="profile-phone" type="tel" inputMode="numeric" value={value.phone} onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 8) })} placeholder="700 00 000" autoComplete="tel-national" className="border-0 bg-transparent focus-visible:ring-0" />
              </div>
            </Field>
          </div>

          {isCompany && (
            <>
              <Field label="Dirección" htmlFor="profile-address" optional>
                <Input id="profile-address" value={value.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Ej. Parque Industrial, Manzana 5" autoComplete="street-address" />
              </Field>
              <Field label={isBuyer ? "Responsable de abastecimiento" : "Persona de contacto"} htmlFor="profile-contact" optional>
                <Input id="profile-contact" value={value.contactName} onChange={(e) => onChange({ contactName: e.target.value })} placeholder="Ej. María Fernández" autoComplete="name" />
              </Field>
            </>
          )}

          {isIndividual && <p className="text-sm leading-relaxed text-muted-foreground">Podés completar ubicación y otros datos más adelante desde tu perfil.</p>}
        </div>
      )}
    </div>
  );
}

function ProfileTypeButton({ active, icon: Icon, title, description, onClick }: { active: boolean; icon: typeof UserRound; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("flex min-h-28 flex-col items-start rounded-xl border bg-card p-4 text-left outline-none transition-[border-color,background-color] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", active ? "border-primary bg-primary/[0.04]" : "border-border hover:border-primary/35")}>
      <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
      <span className="mt-4 text-sm font-semibold text-foreground">{title}</span>
      <span className="mt-1 text-xs leading-snug text-muted-foreground">{description}</span>
    </button>
  );
}

function Field({ label, htmlFor, optional, children }: { label: string; htmlFor: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}{optional && <span className="font-normal text-muted-foreground">Opcional</span>}</Label>
      {children}
    </div>
  );
}
