import { Fastqs } from "@/components/Fastqs.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/fastqs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Fastqs />
      <Outlet />
    </>
  );
}
