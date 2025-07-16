import { Files } from "@/components/Files.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/files")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Files />
      <Outlet />
    </>
  );
}
