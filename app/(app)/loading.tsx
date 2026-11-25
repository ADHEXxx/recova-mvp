import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando contenido">
      <div className="space-y-3"><Skeleton className="h-8 w-56" /><Skeleton className="h-5 w-full max-w-md" /></div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}</div>
      <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
