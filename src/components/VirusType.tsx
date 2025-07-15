import { Badge } from "@/components/ui/badge.tsx";
import { Circle, Hexagon, SatelliteIcon } from "lucide-react";

type VirusType = "SATELLITE" | "VIRUS" | "VIROID";

interface VirusTypeProps {
  type: VirusType | null;
}

export function VirusType({ type }: VirusTypeProps) {
  if (!type) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  switch (type) {
    case "VIRUS":
      return (
        <Badge variant="outline">
          <Hexagon />
          Virus
        </Badge>
      );
    case "SATELLITE":
      return (
        <Badge variant="outline">
          <SatelliteIcon />
          Satellite
        </Badge>
      );
    case "VIROID":
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
