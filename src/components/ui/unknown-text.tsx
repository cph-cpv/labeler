import { cn } from "@/lib/utils.ts";

interface UnknownTextProps {
  children: React.ReactNode;
  className?: string;
}

export function UnknownText({ children, className }: UnknownTextProps) {
  return (
    <span className={cn("text-muted-foreground italic", className)}>
      {children}
    </span>
  );
}
