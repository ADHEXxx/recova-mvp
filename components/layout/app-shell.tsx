"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore, useCurrentCompany } from "@/lib/store";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { TopHeader } from "./top-header";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const company = useCurrentCompany();
  const router = useRouter();

  useEffect(() => {
    if (state.hydrated && !company) {
      router.replace("/");
    }
  }, [state.hydrated, company, router]);

  if (!state.hydrated || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="recova-mvp min-h-svh bg-secondary sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-svh max-w-4xl flex-col bg-background sm:min-h-[calc(100svh-3rem)] sm:rounded-3xl sm:border sm:border-border sm:shadow-xl">
        <TopHeader company={company} />
        <main className="w-full flex-1 px-4 py-6 sm:px-8">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
