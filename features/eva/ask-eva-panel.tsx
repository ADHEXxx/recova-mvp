"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, MessageCircleQuestion, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { EvaAvatar } from "@/components/shared/eva-avatar";
import { useCurrentCompany, useStore } from "@/lib/store";
import { Role } from "@/types";

const QUESTIONS_GENERATOR = ["¿Por qué este match tiene alta compatibilidad?", "¿Me conviene agrupar mi lote?", "¿Cómo puedo aumentar su valor?", "¿Qué empresas podrían usar este material?"];
const QUESTIONS_BUYER = ["¿Por qué este match tiene alta compatibilidad?", "¿Me conviene esperar por más volumen?", "¿Qué generador tiene mejor reputación?", "¿Cómo reduzco mi radio de búsqueda sin perder opciones?"];
type ChatItem = { role: "user" | "assistant"; content: string };

export function AskEvaPanel({ role }: { role: Role }) {
  const company = useCurrentCompany();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ChatItem[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const questions = role === "GENERATOR" ? QUESTIONS_GENERATOR : QUESTIONS_BUYER;

  async function ask(question: string) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading || !company) return;
    const nextThread = [...thread, { role: "user" as const, content: cleanQuestion }];
    setThread(nextThread);
    setDraft("");
    setError("");
    setLoading(true);

    const materials = state.materials.filter((item) => item.companyId === company.id).slice(0, 20).map(({ name, materialType, quantity, unit, condition, cleanliness, city, frequency, status }) => ({ name, materialType, quantity, unit, condition, cleanliness, city, frequency, status }));
    const requirements = state.requirements.filter((item) => item.companyId === company.id).slice(0, 20).map(({ materialType, minQuantity, idealQuantity, unit, minQuality, city, radiusKm, frequency, status }) => ({ materialType, minQuantity, idealQuantity, unit, minQuality, city, radiusKm, frequency, status }));

    try {
      const response = await fetch("/api/eva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextThread.slice(-8),
          context: { accountType: company.accountType, role: company.role, sector: company.sector, materialUse: company.materialUse, city: company.city, hasTransport: company.hasTransport, acceptsGrouping: company.acceptsGrouping, materials, requirements },
        }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error || "No se pudo obtener una respuesta.");
      setThread((current) => [...current, { role: "assistant", content: data.answer! }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "EVA no está disponible en este momento.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <MessageCircleQuestion className="h-4 w-4" /> Preguntar a EVA
      </Button>

      <ResponsiveDialog open={open} onOpenChange={setOpen} title="Preguntar a EVA" description="Orientación inteligente basada en tus datos de Recova.">
        <div aria-live="polite" className="max-h-[48vh] space-y-3 overflow-y-auto pr-1">
          {thread.length === 0 && (
            <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
              <EvaAvatar size="sm" />
              <p className="text-sm leading-6 text-secondary-foreground">Hola, soy EVA. Preguntame sobre tus materiales, oportunidades o cómo mejorar un match.</p>
            </div>
          )}
          {thread.map((item, index) => (
            <div key={`${item.role}-${index}`} className={item.role === "user" ? "flex items-start justify-end gap-2" : "flex items-start gap-2"}>
              {item.role === "assistant" && <EvaAvatar size="sm" />}
              <div className={item.role === "user" ? "max-w-[82%] rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-sm leading-6 text-primary-foreground" : "max-w-[82%] whitespace-pre-wrap rounded-xl rounded-tl-sm bg-secondary px-3 py-2 text-sm leading-6 text-secondary-foreground"}>{item.content}</div>
              {item.role === "user" && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary"><User className="h-4 w-4" /></div>}
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><EvaAvatar size="sm" /><LoaderCircle className="h-4 w-4 animate-spin" /> EVA está pensando…</div>}
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {questions.map((question) => (
            <button key={question} type="button" disabled={loading} onClick={() => void ask(question)} className="min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{question}</button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-3 flex items-center gap-2">
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribí tu pregunta…" aria-label="Pregunta para EVA" maxLength={600} disabled={loading} />
          <Button type="submit" size="icon" disabled={loading || !draft.trim()} aria-label="Enviar pregunta">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">EVA puede equivocarse. Verificá datos críticos antes de cerrar una operación.</p>
      </ResponsiveDialog>
    </>
  );
}
