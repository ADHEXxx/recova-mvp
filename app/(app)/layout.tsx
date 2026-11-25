import { AppShell } from "@/components/layout/app-shell";
import { ReactNode } from "react";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
