"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { operations } from "@/data/operations";
import { findMatches } from "@/lib/eva/matching";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Handshake, Package, Scale, TrendingUp, Wallet } from "lucide-react";
import { formatBs, formatDate, formatKg } from "@/lib/format";

type AdminTab = "companies" | "materials" | "requirements" | "operations";

export function AdminView() {
  const { state } = useStore();
  const [tab, setTab] = useState<AdminTab>("companies");

  const activeMaterials = state.materials.filter((m) => m.status === "active");
  const activeRequirements = state.requirements.filter((r) => r.status === "active");
  const matches = useMemo(() => findMatches(state.requirements, state.materials), [state.requirements, state.materials]);
  const closedOperations = operations.filter((o) => o.status === "Operación cerrada");
  const kgTransacted = operations.reduce((s, o) => s + o.quantity, 0);
  const totalValue = operations.reduce((s, o) => s + o.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Empresas activas" value={String(state.companies.length)} icon={Building2} />
        <MetricCard label="Kg publicados" value={formatKg(activeMaterials.reduce((s, m) => s + m.quantity, 0))} icon={Package} accent="accent" />
        <MetricCard label="Kg transaccionados" value={formatKg(kgTransacted)} icon={Scale} />
        <MetricCard label="Matches generados" value={String(matches.length)} icon={Handshake} accent="accent" />
        <MetricCard label="Operaciones cerradas" value={String(closedOperations.length)} icon={TrendingUp} />
        <MetricCard label="Valor movilizado" value={formatBs(totalValue)} icon={Wallet} accent="accent" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminTab)}>
        <TabsList className="w-full overflow-x-auto sm:w-auto">
          <TabsTrigger value="companies">Empresas ({state.companies.length})</TabsTrigger>
          <TabsTrigger value="materials">Materiales ({activeMaterials.length})</TabsTrigger>
          <TabsTrigger value="requirements">Necesidades ({activeRequirements.length})</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {tab === "companies" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Verificada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.role === "GENERATOR" ? "Generador" : "Empresa usuaria"}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.sector}</TableCell>
                  <TableCell>{c.rating > 0 ? c.rating.toFixed(1) : "—"}</TableCell>
                  <TableCell>{c.verified ? "Sí" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === "materials" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.materialType}</TableCell>
                  <TableCell>{formatKg(m.quantity, m.unit)}</TableCell>
                  <TableCell>{m.city}</TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === "requirements" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Ideal</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.requirements.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.materialType}</TableCell>
                  <TableCell>{formatKg(r.minQuantity, r.unit)}</TableCell>
                  <TableCell>{formatKg(r.idealQuantity, r.unit)}</TableCell>
                  <TableCell>{r.city}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === "operations" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{formatDate(o.date)}</TableCell>
                  <TableCell className="font-medium">{o.materialType}</TableCell>
                  <TableCell>{formatKg(o.quantity, o.unit)}</TableCell>
                  <TableCell>{formatBs(o.value)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status === "Operación cerrada" ? "completed" : "active"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
