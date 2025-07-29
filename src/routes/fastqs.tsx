import { Fastqs } from "@/components/Fastqs.tsx";
import { SelectionProvider } from "@/hooks/useSelection.tsx";
import type { FastqsCategory } from "@/types.ts";
import { createFileRoute, Outlet } from "@tanstack/react-router";

type FastqsSearch = {
  category?: FastqsCategory;
  type?: string | string[];
  search?: string;
  page?: number;
};

export const Route = createFileRoute("/fastqs")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): FastqsSearch => ({
    category: search.category as FastqsSearch["category"],
    type: search.type as string | string[],
    search: search.search as string,
    page: search.page ? Number(search.page) : undefined,
  }),
});

function RouteComponent() {
  return (
    <SelectionProvider>
      <Fastqs />
      <Outlet />
    </SelectionProvider>
  );
}
