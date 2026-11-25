import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MATERIAL_QR_SCAN_PATH } from "@/lib/nav";

export function SimulateQrButton() {
  return (
    <Button asChild variant="secondary" className="w-full sm:w-auto">
      <Link href={MATERIAL_QR_SCAN_PATH}><QrCode aria-hidden="true" /> Simular escaneo de QR</Link>
    </Button>
  );
}
