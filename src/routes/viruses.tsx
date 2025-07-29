import { Viruses } from "@/components/Viruses.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

type VirusesSearch = {
  page?: number;
  search?: string;
};

export const Route = createFileRoute("/viruses")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): VirusesSearch => ({
    page: search.page ? Number(search.page) : undefined,
    search: search.search as string,
  }),
});

function RouteComponent() {
  return (
    <>
      <Viruses />
      <Outlet />
    </>
  );
}
