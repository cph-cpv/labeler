import { FilesDetail } from "@/components/FilesDetail.tsx";
import { FilesProvider } from "@/contexts/FilesContext.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase";
import type { Fastq } from "@/types.ts";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const {
    data: fastq,
    loading,
    error,
    notFound,
    refetch,
  } = usePocketBaseRecord<Fastq>("files", id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (notFound || !fastq) {
    return <Navigate to="/files" />;
  }

  if (error) {
    return <div>Error loading file: {error.message}</div>;
  }

  const handleClose = () => {
    navigate({ to: "/files" });
  };

  return (
    <FilesProvider refetchFiles={refetch}>
      <FilesDetail fastq={fastq} open={true} onOpenChange={handleClose} />
    </FilesProvider>
  );
}
