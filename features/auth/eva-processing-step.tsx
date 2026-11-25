"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";

export function EvaProcessingStep({ role, onDone }: { role: Role; onDone: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {ready ? <CheckCircle2 className="h-8 w-8 text-success" /> : <Loader2 className="h-8 w-8 animate-spin" />}
      </div>

      {!ready ? (
        <>
          <h2 className="mt-5 flex items-center gap-1.5 text-lg font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-brand-accent" />
            EVA está {role === "GENERATOR" ? "preparando tu perfil" : "configurando tus preferencias de abastecimiento"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Estamos clasificando tus materiales y buscando las primeras coincidencias compatibles.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-lg font-semibold text-foreground">Perfil listo.</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Ya podés explorar el marketplace y ver las oportunidades que EVA encontró para vos.
          </p>
          <Button className="mt-6 w-full max-w-xs" size="lg" onClick={onDone}>
            Ir a mi panel
          </Button>
        </>
      )}
    </div>
  );
}
