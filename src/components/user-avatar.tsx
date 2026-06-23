import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/user-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sizeClasses = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-24 text-2xl",
} as const;

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  email,
  image,
  size = "md",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = getUserInitials(name, email);
  const alt = name?.trim() || email || "User";

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={image ?? undefined} alt={alt} />
      <AvatarFallback
        className={cn(
          "bg-primary/10 font-semibold text-primary",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
