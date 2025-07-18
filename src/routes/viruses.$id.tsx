import { VirusesDetail } from "@/components/VirusesDetail.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/viruses/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const handleClose = () => {
    navigate({ to: "/viruses" });
  };

  return <VirusesDetail virusId={id} open={true} onClose={handleClose} />;
}
