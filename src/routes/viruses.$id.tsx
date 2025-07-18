import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase.ts";
import type { Virus } from "@/types.ts";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/viruses/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const {
    data: virus,
    loading,
    error,
    notFound,
  } = usePocketBaseRecord<Virus>("viruses", id);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={() => navigate({ to: "/viruses" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading virus...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || notFound || !virus) {
    return <Navigate to="/viruses" />;
  }

  const handleClose = () => {
    navigate({ to: "/viruses" });
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{virus.name}</DialogTitle>
          <DialogDescription>Virus Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 prose">
          <div>
            <strong>Acronym:</strong> {virus.acronym}
          </div>
          <div>
            <strong>Type:</strong> {virus.type}
          </div>
          <div>
            <strong>UUID:</strong> {virus.uuid}
          </div>
          <div>
            <strong>Synonyms:</strong>
          </div>
          {virus.synonyms && virus.synonyms.length ? (
            <div>
              <ul>
                {(typeof virus.synonyms === "string"
                  ? virus.synonyms.split(",").map((s) => s.trim())
                  : virus.synonyms
                ).map((synonym, index) => (
                  <li key={index}>{synonym}</li>
                ))}
              </ul>
            </div>
          ) : (
            "No synonyms"
          )}
          <h2 className="font-bold">Samples</h2>
        </div>
      </DialogContent>
    </Dialog>
  );
}
