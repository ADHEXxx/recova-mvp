export function formatKg(value: number, unit: string = "kg") {
  return `${new Intl.NumberFormat("es-BO").format(value)} ${unit}`;
}

export function formatBs(value: number) {
  return `Bs ${new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

export function formatPriceRange(min: number, max: number, unit: string = "kg") {
  return `Bs ${min.toFixed(2)}–${max.toFixed(2)}/${unit}`;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMin / 60);
  const diffD = Math.round(diffH / 24);

  if (diffMin < 1) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffD === 1) return "hace 1 día";
  if (diffD < 30) return `hace ${diffD} días`;
  return date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}
