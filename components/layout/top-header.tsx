"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Company } from "@/types";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, useStoreActions } from "@/lib/store";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { MVP_ACCOUNTS } from "@/lib/mvp-accounts";

export function TopHeader({ company }: { company: Company }) {
  const { state } = useStore();
  const { login, logout } = useStoreActions();
  const router = useRouter();
  const unread = state.notifications.filter((n) => n.companyId === company.id && !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-x-2 border-b border-border bg-card/95 px-3 py-1 backdrop-blur-xl sm:rounded-t-3xl sm:px-6">
      <Logo href="/dashboard" />
      <div className="flex items-center gap-1">
        <div role="group" aria-label="Cambiar rol" className="flex items-center rounded-full border border-border bg-secondary p-0.5">
          {(["GENERATOR", "BUYER"] as const).map((role) => (
            <button key={role} type="button" aria-pressed={company.role === role}
              className="min-h-11 rounded-full px-2 text-xs font-semibold text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground sm:px-3"
              onClick={() => {
                if (company.role === role) return;
                login(MVP_ACCOUNTS[role]);
                router.push("/dashboard");
              }}>{role === "GENERATOR" ? "Generador" : "Comprador"}</button>
          ))}
        </div>
        <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
          <Link href="/notifications" aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}>
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brand-accent" />
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label={`Abrir menú de ${company.name}`} className="rounded-full shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <CompanyAvatar photoUrl={company.contactPhotoUrl} initials={company.logoInitials} name={company.name} size="lg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{company.name}</p>
              <p className="text-xs text-muted-foreground">{company.contactName}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
