"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarUserProps
  extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string | null;
  name?: string | null;
  alt?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}

export function AvatarUser({
  src,
  name,
  alt,
  className,
  fallbackClassName,
  iconClassName,
  ...props
}: AvatarUserProps) {
  // Helper to calculate initials (max 2 letters uppercase)
  const initials = React.useMemo(() => {
    if (!name || !name.trim()) return null;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }, [name]);

  return (
    <Avatar
      className={cn("w-11 h-11 shrink-0 shadow-inner", className)}
      {...props}
    >
      <AvatarImage src={src || ""} alt={alt || name || "User avatar"} />
      <AvatarFallback
        className={cn(
          "bg-olive-900 text-white font-medium flex items-center justify-center select-none text-sm border border-olive-800/40",
          fallbackClassName
        )}
      >
        {initials ? (
          <span>{initials}</span>
        ) : (
          <User
            className={cn("text-white/80 w-5 h-5", iconClassName)}
            strokeWidth={1.5}
          />
        )}
      </AvatarFallback>
    </Avatar>
  );
}

export default AvatarUser;
