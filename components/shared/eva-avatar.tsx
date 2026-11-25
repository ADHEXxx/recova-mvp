import Image from "next/image";
import evaMascot from "@/public/eva/eva-mascot.png";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-8",
  md: "size-11",
  lg: "size-16",
} as const;

export function EvaAvatar({
  size = "md",
  className,
  priority = false,
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#062f3b]",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src={evaMascot}
        alt=""
        fill
        priority={priority}
        sizes={size === "lg" ? "64px" : size === "md" ? "44px" : "32px"}
        className="object-contain p-0.5"
      />
    </span>
  );
}
