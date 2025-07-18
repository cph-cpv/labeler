import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { usePocketBaseRecord } from "@/hooks/usePocketBase.ts";
import type { Virus } from "@/types.ts";

type VirusesDetailProps = {
  virusId: string;
  open: boolean;
  onClose: () => void;
};

export function VirusesDetail({ virusId, open, onClose }: VirusesDetailProps) {
  const {
    data: virus,
    loading,
    error,
    notFound,
  } = usePocketBaseRecord<Virus>("viruses", virusId);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading virus...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || notFound || !virus) {
    onClose();
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          <h2 className="font-bold">Samples</h2>
        </div>
      </DialogContent>
    </Dialog>
  );
}
