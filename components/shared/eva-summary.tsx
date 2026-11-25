import { EvaAvatar } from "./eva-avatar";

export function EvaSummary({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <section className="relative overflow-hidden rounded-xl border border-primary/15 bg-primary/[0.045] p-5" aria-labelledby="eva-summary-title">
      <div className="absolute inset-y-0 left-0 w-1 bg-brand-accent" />
      <div className="flex items-center gap-2">
        <EvaAvatar size="sm" />
        <h3 id="eva-summary-title" className="text-base font-semibold text-foreground">Resumen inteligente de EVA</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
