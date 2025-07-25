import { cn } from "@/lib/utils";
import { CircleSlash, Ghost } from "lucide-react";

export function TableMissingIcon({
  className,
  ...props
}: React.ComponentProps<typeof Ghost>) {
  return (
    <CircleSlash
      className={cn("size-3.5 text-red-400", className)}
      {...props}
    />
  );
}
