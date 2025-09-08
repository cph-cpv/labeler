import { Exceptions } from "@/components/Exceptions.tsx";
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
import type { BaseSample, Sample, Virus } from "@/types.ts";
import { useEffect, useState } from "react";

type SamplesVirusesEditProps = {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SampleViruses({
  isOpen,
  onClose,
  sample,
}: SamplesVirusesEditProps) {
  const [selectedViruses, setSelectedViruses] = useState<Virus[]>([]);

  const sampleMutation = usePocketBaseMutation<BaseSample>("samples");

  // Initialize selected viruses from sample data
  useEffect(() => {
    if (sample) {
      setSelectedViruses(sample.viruses);
    }
  }, [sample]);

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

        <h2>Exceptions</h2>
        <Exceptions sampleId={sample.id} />

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
