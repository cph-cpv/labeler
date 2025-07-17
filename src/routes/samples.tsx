import { Samples } from "@/components/Samples.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/samples")({
  component: Samples,
});
