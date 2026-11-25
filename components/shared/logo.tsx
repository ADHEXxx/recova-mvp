import Link from "next/link";
import Image from "next/image";
import recovaMark from "@/public/brand/recova-mark.png";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "light",
  href = "/",
  className,
}: {
  variant?: "light" | "dark";
  href?: string;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg",
          variant === "dark" && "bg-white/95 p-1",
        )}
      >
        <Image
          src={recovaMark}
          alt=""
          fill
          priority
          sizes="36px"
          className={cn("object-contain", variant === "dark" && "p-1")}
        />
      </span>
      <span
        className={cn(
          "text-xl font-semibold tracking-[-0.025em]",
          variant === "dark" ? "text-sidebar-foreground" : "text-foreground",
        )}
      >
        Recova
      </span>
    </span>
  );

  return href ? (
    <Link
      href={href}
      aria-label="Recova — inicio"
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  ) : content;
}
