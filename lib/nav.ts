import {
  Home,
  Store,
  Handshake,
  Package,
  QrCode,
  ClipboardList,
  Sparkles,
  History,
  Bell,
  User,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MATERIAL_QR_SCAN_PATH = "/materials/escanear";

export function mobileNavItems(role: Role): NavItem[] {
  return [
    { label: "Inicio", href: "/dashboard", icon: Home },
    { label: "Materiales", href: "/marketplace", icon: Package },
    ...(role === "GENERATOR" ? [{ label: "Escanear QR", href: MATERIAL_QR_SCAN_PATH, icon: QrCode }] : []),
    { label: "EVA", href: "/eva", icon: Sparkles },
    { label: "Operaciones", href: "/history", icon: History },
  ];
}

export function desktopNavItems(role: Role): NavItem[] {
  const base: NavItem[] = [
    { label: "Inicio", href: "/dashboard", icon: Home },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "Matches", href: "/matches", icon: Handshake },
  ];
  const roleSpecific: NavItem =
    role === "GENERATOR"
      ? { label: "Mis materiales", href: "/materials", icon: Package }
      : { label: "Mis necesidades", href: "/requirements", icon: ClipboardList };

  return [
    ...base,
    roleSpecific,
    { label: "EVA", href: "/eva", icon: Sparkles },
    { label: "Historial", href: "/history", icon: History },
    { label: "Notificaciones", href: "/notifications", icon: Bell },
    { label: "Perfil", href: "/profile", icon: User },
  ];
}
