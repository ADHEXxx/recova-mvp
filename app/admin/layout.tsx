import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo href="/admin" />
          <span className="hidden rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground sm:inline-block">
            Panel de administración
          </span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Volver a la app</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
