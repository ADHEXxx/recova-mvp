"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { desktopNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Company } from "@/types";
import { Settings, LogOut } from "lucide-react";
import { useStoreActions } from "@/lib/store";
import { Logo } from "@/components/shared/logo";

export function AppSidebar({ company }: { company: Company }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStoreActions();
  const items = desktopNavItems(company.role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo variant="dark" href="/dashboard" />
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 px-3 py-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sidebar-primary" />}
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-3">
        <Link
          href="/settings"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Settings className="h-4.5 w-4.5" />
          Configuración
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <LogOut className="h-4.5 w-4.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
