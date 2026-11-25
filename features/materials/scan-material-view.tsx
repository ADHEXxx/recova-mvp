"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MVP_ACCOUNTS } from "@/lib/mvp-accounts";
import { useCurrentCompany, useStoreActions } from "@/lib/store";
import sampleQr from "@/public/brand/recova-lote-qr.png";

export function ScanMaterialView() {
  const company = useCurrentCompany();
  const { login } = useStoreActions();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const isBuyer = company?.role === "BUYER";

  useEffect(() => {
    if (!scanning || company?.role !== "GENERATOR") return;
    const timer = window.setTimeout(() => router.push("/materials/new?scan=qr"), 1000);
    return () => window.clearTimeout(timer);
  }, [company?.role, router, scanning]);

  function startScan() {
    if (!company || scanning) return;
    if (isBuyer) login(MVP_ACCOUNTS.GENERATOR);
    setScanning(true);
  }

  return (
    <section className="mx-auto max-w-md space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Escanear QR del lote</h1>
        <p className="text-sm text-muted-foreground">
          {isBuyer
            ? "Para probar la carga de un lote, cambiá al rol Generador e iniciá el escaneo."
            : "Simulá la lectura de una etiqueta para cargar los datos del contenedor."}
        </p>
      </header>
      <div className="grid justify-items-center gap-4 rounded-2xl bg-[#14362b] px-4 py-6 text-white">
        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-300/60 bg-white p-2">
          <Image src={sampleQr} alt="Código QR de ejemplo del contenedor REC-0248" width={144} height={144} priority />
          {scanning && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 shadow-[0_0_12px_3px_#34d399] motion-safe:animate-[material-qr-sweep_1s_ease-in-out_both]" />
          )}
        </div>
        <p role="status" className="text-sm font-medium">{scanning ? "Leyendo el QR…" : "Contenedor de ejemplo · REC-0248"}</p>
      </div>
      <Button type="button" size="lg" className="h-auto min-h-12 w-full whitespace-normal" disabled={scanning} onClick={startScan}>
        <ScanLine aria-hidden="true" /> {scanning ? "Escaneando…" : isBuyer ? "Cambiar a Generador y escanear" : "Simular escaneo de QR"}
      </Button>
    </section>
  );
}
