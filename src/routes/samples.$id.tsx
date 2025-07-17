import { SamplesDetail } from "@/components/SamplesDetail.tsx";
import data from "@/fake/samples.json";
import type { Sample } from "@/types.ts";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/samples/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const sample = data.find((s: Sample) => s.id === parseInt(id));

  if (!sample) {
    return <Navigate to="/samples" />;
  }

  const handleClose = () => {
    navigate({ to: "/samples" });
  };

  return (
    <SamplesDetail sample={sample} open={true} onOpenChange={handleClose} />
  );
}
