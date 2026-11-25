"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MultiSelectChips<T extends string>({
  options,
  value,
  onChange,
  allowCustom = false,
}: {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  allowCustom?: boolean;
}) {
  const [custom, setCustom] = useState("");
  const customValues = value.filter((item) => !options.some((option) => option === item));
  function toggle(opt: T) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  function addCustom() {
    const next = custom.trim() as T;
    if (!next || value.some((item) => item.toLowerCase() === next.toLowerCase())) return;
    onChange([...value, next]);
    setCustom("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "min-h-10 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50",
            )}
          >
            {opt}
          </button>
        );
      })}
      {customValues.map((item) => (
        <button key={item} type="button" onClick={() => toggle(item)} className="min-h-10 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
          {item} ×
        </button>
      ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2">
          <Input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustom(); } }} placeholder="Otro material" aria-label="Agregar otro material" />
          <Button type="button" variant="outline" onClick={addCustom} disabled={!custom.trim()} aria-label="Agregar material"><Plus /></Button>
        </div>
      )}
    </div>
  );
}
