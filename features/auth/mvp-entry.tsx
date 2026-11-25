"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Factory, Package } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { MVP_ACCOUNTS } from "@/lib/mvp-accounts";
import { useStore, useStoreActions } from "@/lib/store";
import type { Role } from "@/types";

const roles = [
  { role: "GENERATOR", label: "Generador", description: "Publicá materiales de tu planta y encontrá quién puede aprovecharlos.", icon: Package },
  { role: "BUYER", label: "Comprador", description: "Encontrá materiales secundarios para incorporarlos a tu producción.", icon: Factory },
] as const;

export function MvpEntry() {
  const [role, setRole] = useState<Role>("GENERATOR");
  const { state } = useStore();
  const { login } = useStoreActions();
  const router = useRouter();

  return (
    <main className="recova-mvp grid min-h-svh place-items-center bg-secondary sm:p-8">
      <div className="flex min-h-svh w-full max-w-md flex-col bg-background px-6 py-8 sm:min-h-[650px] sm:rounded-[2.5rem] sm:border-[8px] sm:border-[#15372b] sm:px-8 sm:shadow-2xl">
        <div className="flex justify-center"><Logo href="" /></div>
        <div className="my-auto py-8">
          <h1 className="text-center text-2xl font-bold tracking-tight">¿Cómo vas a usar Recova?</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">Mercado de materiales secundarios · Santa Cruz, Bolivia</p>
          <div role="group" aria-label="Tipo de usuario" className="mt-8 grid gap-3">
            {roles.map(({ role: value, label, description, icon: Icon }) => (
              <button key={value} type="button" aria-pressed={role === value} onClick={() => setRole(value)}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors aria-pressed:border-primary aria-pressed:bg-accent hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
                <span className="flex-1"><strong className="block">{label}</strong><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span></span>
                {role === value && <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        </div>
        <Button size="lg" className="w-full rounded-xl" disabled={!state.hydrated} onClick={() => {
          login(MVP_ACCOUNTS[role]);
          router.push("/dashboard");
        }}>Continuar <ArrowRight /></Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">Entorno de evaluación con datos de ejemplo</p>
      </div>
    </main>
  );
}
