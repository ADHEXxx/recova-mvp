import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  leading,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  leading?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6", className)}>
      <div className="flex min-w-0 items-center gap-4">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="w-full shrink-0 [&>*]:w-full sm:w-auto sm:[&>*]:w-auto">{action}</div>}
    </div>
  );
}
