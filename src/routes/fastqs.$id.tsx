import { FastqsDetail } from "@/components/FastqsDetail.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/fastqs/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const handleClose = useCallback(() => {
    navigate({ to: "/fastqs" });
  }, [navigate]);

  return <FastqsDetail id={id} open={true} onOpenChange={handleClose} />;
}
