import { FilesDetail } from "@/components/FilesDetail.tsx";
import type { Fastq } from "@/types.ts";
import data from "@/fake/fastq.json";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const fastq = data.find((f: Fastq) => f.id === parseInt(id));

  if (!fastq) {
    return <Navigate to="/files" />;
  }

  const handleClose = () => {
    navigate({ to: "/files" });
  };

  return (
    <FilesDetail
      fastq={fastq}
      open={true}
      onOpenChange={handleClose}
    />
  );
}