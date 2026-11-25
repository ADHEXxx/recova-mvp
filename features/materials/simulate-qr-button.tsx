import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SimulateQrButton() {
  return (
    <Button asChild variant="secondary" className="w-full sm:w-auto">
      <Link href="/materials/new?scan=qr"><QrCode aria-hidden="true" /> Simular escaneo de QR</Link>
    </Button>
  );
}
