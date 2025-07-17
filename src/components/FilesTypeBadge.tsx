import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/utils.ts";

type FastqType = "dsRNA" | "smRNA" | "Unknown";

interface FilesTypeBadgeProps {
  type: FastqType | null;
  className?: string;
}

export function FilesTypeBadge({ type, className }: FilesTypeBadgeProps) {
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

  const getVariantForType = (type: FastqType) => {
    switch (type) {
      case "dsRNA":
        return "default";
      case "smRNA":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariantForType(type)} className={className}>
      {type}
    </Badge>
  );
}
