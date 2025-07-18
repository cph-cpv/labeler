import { SamplesDetail } from "@/components/SamplesDetail.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase.ts";
import type { Sample } from "@/types.ts";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/samples/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const {
    data: sample,
    loading,
    error,
  } = usePocketBaseRecord<Sample>("samples", id);

  const handleClose = () => {
    navigate({ to: "/samples" });
  };

  if (loading) {
    return <div className="text-center py-8">Loading sample...</div>;
  }

  if (error || !sample) {
    return <Navigate to="/samples" />;
  }

  return (
    <SamplesDetail sample={sample} open={true} onOpenChange={handleClose} />
  );
}
