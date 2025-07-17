import { cn } from "@/lib/utils.ts";
import { Link as RouterLink } from "@tanstack/react-router";
import * as React from "react";

interface LinkProps extends React.ComponentProps<typeof RouterLink> {
  className?: string;
}

function Link({ className, ...props }: LinkProps) {
  return (
    <RouterLink
      className={cn(
        "text-blue-600",
        "font-medium",
        "hover:text-primary/80",
        "underline-offset-4",
        "hover:underline",
        className,
      )}
      {...props}
    />
  );
}

export { Link };
