import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-foreground">Bienvenido de nuevo</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Iniciá sesión para ver las oportunidades que EVA encontró para vos.
        </p>
        <div className="mt-6 flex justify-center">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Creá una gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
