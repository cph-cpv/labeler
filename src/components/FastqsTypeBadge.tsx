import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

type FastqType = "dsRNA" | "smRNA" | "Unknown";

function getVariantForType(type: FastqType) {
  switch (type) {
    case "dsRNA":
      return "default";
    case "smRNA":
      return "secondary";
    default:
      return "outline";
  }
}

type FastqsTypeBadgeProps = {
  type: FastqType | null;
  className?: string;
};

export function FastqsTypeBadge({ type, className }: FastqsTypeBadgeProps) {
  if (!type || type === "Unknown") {
    return (
      <Badge
        variant="outline"
        className={cn("text-muted-foreground", className)}
      >
        Unknown
      </Badge>
    );
  }

  return (
    <Badge variant={getVariantForType(type)} className={className}>
      {type}
    </Badge>
  );
}
