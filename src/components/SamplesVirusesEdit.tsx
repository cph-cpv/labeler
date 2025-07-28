import { SamplesLabeler } from "@/components/SamplesLabeler.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import { useViruses } from "@/hooks/useViruses.ts";
import type { Sample, Virus } from "@/types.ts";
import { useEffect, useState } from "react";

type SamplesVirusesEditProps = {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SamplesVirusesEdit({
  sample,
  isOpen,
  onClose,
}: SamplesVirusesEditProps) {
  const [selectedViruses, setSelectedViruses] = useState<Virus[]>([]);

  const { viruses: allViruses } = useViruses({});
  const sampleMutation = usePocketBaseMutation<Sample>("samples");

  // Initialize selected viruses from sample data
  useEffect(() => {
    if (sample && allViruses) {
      const sampleVirusIds = new Set(sample.viruses || []);
      const initialSelectedViruses = allViruses.filter((virus) =>
        sampleVirusIds.has(virus.id),
      );
      setSelectedViruses(initialSelectedViruses);
    }
  }, [sample, allViruses]);

  async function handleSave() {
    if (!sample) return;

    const virusIds = selectedViruses.map((v) => v.id);
    await sampleMutation.updateAsync({
      id: sample.id,
      data: { viruses: virusIds },
    });

    onClose();
  }

  function handleVirusSelect(virus: Virus) {
    setSelectedViruses((prev) => [...prev, virus]);
  }

  function handleVirusRemove(virus: Virus) {
    setSelectedViruses((prev) => prev.filter((v) => v.id !== virus.id));
  }

  if (!sample) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Virus Labels - {sample.name}</DialogTitle>
          <DialogDescription>
            Select viruses to associate with this sample.
          </DialogDescription>
        </DialogHeader>

        <SamplesLabeler
          selectedViruses={selectedViruses}
          onVirusSelect={handleVirusSelect}
          onVirusRemove={handleVirusRemove}
        />

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={sampleMutation.isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={sampleMutation.isUpdating}
          >
            {sampleMutation.isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
