"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { Label } from "@/components/ui/label";
import { useStore, useStoreActions } from "@/lib/store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { state } = useStore();
  const { login } = useStoreActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function enter(companyId: string, name: string) {
    setLoading(true);
    login(companyId);
    setTimeout(() => {
      toast.success(`Sesión iniciada como ${name}`);
      router.push("/dashboard");
    }, 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.hydrated || loading) return;
    if (!email || !password) {
      toast.error("Completá tu correo y contraseña.");
      return;
    }
    const company = state.companies.find((c) => c.authEmail?.toLowerCase() === email.trim().toLowerCase());
    if (!company || company.authPassword !== password) {
      toast.error("Correo o contraseña incorrectos.");
      return;
    }
    enter(company.id, company.name);
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="contacto@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading || !state.hydrated}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
        </Button>
      </form>

    </div>
  );
}
