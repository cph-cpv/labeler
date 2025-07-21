import { cn } from "@/lib/utils.ts";
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "@tanstack/react-router";
import * as React from "react";

interface LinkProps extends RouterLinkProps {
  className?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <RouterLink
        ref={ref}
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
  },
);

Link.displayName = "Link";

export { Link };
