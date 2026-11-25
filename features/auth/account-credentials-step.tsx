import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { Label } from "@/components/ui/label";

export function AccountCredentialsStep({ value, onChange }: { value: { email: string; password: string; confirmPassword: string }; onChange: (patch: Partial<typeof value>) => void }) {
  const mismatch = value.confirmPassword.length > 0 && value.password !== value.confirmPassword;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Creá tu acceso</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">Usarás estos datos para volver a ingresar a Recova.</p>
      </div>
      <div className="space-y-5">
        <Field label="Correo electrónico" htmlFor="register-email">
          <Input id="register-email" type="email" value={value.email} onChange={(event) => onChange({ email: event.target.value })} placeholder="tu@correo.com" autoComplete="email" required />
        </Field>
        <Field label="Contraseña" htmlFor="register-password">
          <PasswordInput id="register-password" value={value.password} onChange={(event) => onChange({ password: event.target.value })} placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="register-confirm-password">
          <PasswordInput id="register-confirm-password" value={value.confirmPassword} onChange={(event) => onChange({ confirmPassword: event.target.value })} placeholder="Repetí tu contraseña" autoComplete="new-password" aria-invalid={mismatch} required />
          {mismatch && <p className="text-sm text-destructive">Las contraseñas no coinciden.</p>}
        </Field>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}
