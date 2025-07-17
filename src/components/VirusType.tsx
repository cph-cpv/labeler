import { Badge } from "@/components/ui/badge.tsx";
import { UnknownText } from "@/components/ui/unknown-text.tsx";
import { Circle, Hexagon, SatelliteIcon } from "lucide-react";

type VirusType = "Satellite" | "Virus" | "Viroid";

interface VirusTypeProps {
  type: VirusType | null;
}

export function VirusType({ type }: VirusTypeProps) {
  if (!type) {
    return <UnknownText>Unknown</UnknownText>;
  }

  switch (type) {
    case "Virus":
      return (
        <Badge variant="outline">
          <Hexagon />
          Virus
        </Badge>
      );
    case "Satellite":
      return (
        <Badge variant="outline">
          <SatelliteIcon />
          Satellite
        </Badge>
      );
    case "Viroid":
      return (
        <Badge variant="outline">
          <Circle />
          Viroid
        </Badge>
      );
    default:
      return null;
  }
}
