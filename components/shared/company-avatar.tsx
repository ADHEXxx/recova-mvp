import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function CompanyAvatar({
  photoUrl,
  initials,
  name,
  size = "default",
  tone = "primary",
  className,
}: {
  photoUrl?: string;
  initials: string;
  name?: string;
  size?: "sm" | "default" | "lg";
  tone?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt={name ?? initials} />}
      <AvatarFallback
        className={cn(
          "font-semibold",
          tone === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
