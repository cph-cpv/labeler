import { Viruses } from "@/components/Viruses.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/viruses")({
  component: Viruses,
});