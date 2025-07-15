import { Files } from "@/components/Files.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/files")({
  component: Files,
});
