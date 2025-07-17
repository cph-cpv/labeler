import { cn } from "@/lib/utils.ts";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const kbdVariants = cva(
  "inline-flex items-center justify-center rounded border p-1.5 text-xs font-mono font-medium shadow-sm min-w-4 h-5",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        outline: "border-2 bg-background text-foreground",
        subtle: "bg-muted border-muted-foreground/20 text-muted-foreground",
        invert:
          "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface KbdProps
  extends React.ComponentProps<"kbd">,
    VariantProps<typeof kbdVariants> {
  shortcut: string;
}

function Kbd({ className, variant, shortcut, ...props }: KbdProps) {
  return (
    <kbd className={cn(kbdVariants({ variant }), className)} {...props}>
      {shortcut}
    </kbd>
  );
}

export { Kbd, kbdVariants };
