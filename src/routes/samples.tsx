import { Samples } from "@/components/Samples.tsx";
import { SelectionProvider } from "@/hooks/useSelection.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/samples")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SelectionProvider>
      <Samples />
      <Outlet />
    </SelectionProvider>
  );
}
