"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCurrentCompany, useStoreActions } from "@/lib/store";
import { toast } from "sonner";

export default function SettingsPage() {
  const company = useCurrentCompany();
  const { updateCompany } = useStoreActions();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  if (!company) return null;

  return (
    <div className="space-y-5">
      <PageHeader title="Configuración" subtitle="Preferencias de tu cuenta en Recova." />

      <Card className="divide-y divide-border p-0">
        <Row
          label="Alertas de nuevos matches por correo"
          checked={emailAlerts}
          onChange={(v) => {
            setEmailAlerts(v);
            toast.success(v ? "Alertas por correo activadas" : "Alertas por correo desactivadas");
          }}
        />
        <Row
          label="Notificaciones push de EVA"
          checked={pushAlerts}
          onChange={(v) => {
            setPushAlerts(v);
            toast.success(v ? "Notificaciones activadas" : "Notificaciones desactivadas");
          }}
        />
        <Row
          label="Aceptar agrupación con otros generadores"
          checked={company.acceptsGrouping}
          onChange={(v) => {
            updateCompany(company.id, { acceptsGrouping: v });
            toast.success("Preferencia actualizada");
          }}
        />
      </Card>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
