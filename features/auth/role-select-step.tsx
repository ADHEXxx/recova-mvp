import { Recycle, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/types";

export function RoleSelectStep({ ready, onSelect }: { ready: boolean; onSelect: (role: Role) => void }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">¿Cómo vas a usar Recova?</h1>
      <p className="mt-1 text-sm text-muted-foreground">Elegí la opción que mejor describe lo que necesitás.</p>

      {!ready && <p role="status" className="mt-3 text-sm text-muted-foreground">Cargando opciones…</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <RoleCard
          disabled={!ready}
          icon={Recycle}
          title="Genero o recolecto"
          text="Tengo materiales ocasionalmente o de forma continua y quiero encontrar quién los utilice."
          onClick={() => onSelect("GENERATOR")}
        />
        <RoleCard
          disabled={!ready}
          icon={Factory}
          title="Empresa usuaria"
          text="Represento a una organización que busca materiales recuperados para abastecerse."
          onClick={() => onSelect("BUYER")}
        />
      </div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  text,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex touch-manipulation select-none flex-col items-start rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors",
        "enabled:cursor-pointer enabled:hover:border-primary enabled:active:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60",
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </button>
  );
}
