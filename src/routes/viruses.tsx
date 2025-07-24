import { Viruses } from "@/components/Viruses.tsx";
import { SelectionProvider } from "@/hooks/useSelection.tsx";
import type { VirusesCategory } from "@/types.ts";
import { createFileRoute, Outlet } from "@tanstack/react-router";

type VirusesSearch = {
  category?: VirusesCategory;
  page?: number;
  search?: string;
};

export const Route = createFileRoute("/viruses")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): VirusesSearch => ({
    category: search.category as VirusesSearch["category"],
    page: search.page ? Number(search.page) : undefined,
    search: search.search as string,
  }),
});

function RouteComponent() {
  return (
    <SelectionProvider>
      <Viruses />
      <Outlet />
    </SelectionProvider>
  );
}
