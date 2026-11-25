"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = mobileNavItems();

  return (
    <nav aria-label="Navegación principal" className="safe-bottom sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl sm:rounded-b-3xl">
      <div className="grid min-h-16 grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
            || (item.href === "/marketplace" && /^\/(materials|requirements)(\/|$)/.test(pathname))
            || (item.href === "/eva" && /^\/(matches|grouping)(\/|$)/.test(pathname));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium outline-none focus-visible:bg-accent"
              aria-current={active ? "page" : undefined}
            >
              {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" />}
              <item.icon
                className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={active ? "text-primary" : "text-muted-foreground"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
