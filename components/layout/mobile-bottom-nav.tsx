"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MATERIAL_QR_SCAN_PATH, mobileNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

export function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = mobileNavItems(role);

  return (
    <nav aria-label="Navegación principal" className="safe-bottom sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl sm:rounded-b-3xl">
      <div className={cn("grid min-h-16", role === "GENERATOR" ? "grid-cols-5" : "grid-cols-4")}>
        {items.map((item) => {
          const scan = item.href === MATERIAL_QR_SCAN_PATH;
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
            || (item.href === "/marketplace" && pathname !== MATERIAL_QR_SCAN_PATH && /^\/(materials|requirements)(\/|$)/.test(pathname))
            || (item.href === "/eva" && /^\/(matches|grouping)(\/|$)/.test(pathname));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-xs leading-tight font-medium outline-none focus-visible:bg-accent"
              aria-current={active ? "page" : undefined}
            >
              {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />}
              <span className={cn(scan && "grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground")}>
                <item.icon aria-hidden="true" className={cn("size-5", !scan && (active ? "text-primary" : "text-muted-foreground"))}
                  strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className={active || scan ? "text-primary" : "text-muted-foreground"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
