import { SamplesAssociator } from "@/components/SamplesAssociator.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  usePocketBaseCollection,
  usePocketBaseMutation,
} from "@/hooks/usePocketBaseQuery.ts";
import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq, Sample } from "@/types.ts";
import { useEffect, useState } from "react";

type SamplesFastqsEditProps = {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SampleFastqs({
  sample,
  isOpen,
  onClose,
}: SamplesFastqsEditProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFastqs, setSelectedFastqs] = useState<Fastq[]>([]);

  // Fetch FASTQs associated with this sample (server state)
  const { data: pbFastqs = [] } = usePocketBaseCollection<Fastq>("fastqs", {
    filter: sample ? `sample = "${sample.id}"` : undefined,
    sort: "name",
  });

  const serverAssociatedFastqs = pbFastqs
    .map(convertPbToUiFastq)
    .filter(Boolean) as Fastq[];

  const fastqMutation = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize selected FASTQs from server data
  useEffect(() => {
    if (sample) {
      setSelectedFastqs(serverAssociatedFastqs);
      setSearchTerm(sample.name);
    }
  }, [sample, serverAssociatedFastqs.map((f) => f.id).join(",")]);

  async function handleSave() {
    if (!sample) return;

    const promises = [];

    // Handle FASTQ associations
    const serverIds = new Set(serverAssociatedFastqs.map((f) => f.id));
    const selectedIds = new Set(selectedFastqs.map((f) => f.id));

    // Find FASTQs to add (in selected but not in server)
    const toAdd = selectedFastqs.filter((f) => !serverIds.has(f.id));

    // Find FASTQs to remove (in server but not in selected)
    const toRemove = serverAssociatedFastqs.filter(
      (f) => !selectedIds.has(f.id),
    );

    // Add FASTQ update promises
    promises.push(
      ...toAdd.map((fastq) =>
        fastqMutation.updateAsync({
          id: fastq.id,
          data: { sample: sample.id },
        }),
      ),
      ...toRemove.map((fastq) =>
        fastqMutation.updateAsync({
          id: fastq.id,
          data: { sample: null },
        }),
      ),
    );

    // Execute all updates
    await Promise.all(promises);
    onClose();
  }

  function handleAddAssociation(fastq: Fastq) {
    setSelectedFastqs((prev) => [...prev, fastq]);
  }

  function handleDeselectFastq(fastqId: string) {
    setSelectedFastqs((prev) => prev.filter((f) => f.id !== fastqId));
  }

  if (!sample) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>FASTQs - {sample.name}</DialogTitle>
          <DialogDescription>
            Associate FASTQ files with this sample.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fastq-search">Search FASTQs</Label>
            <Input
              id="fastq-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for FASTQs"
              disabled={fastqMutation.isUpdating}
            />
          </div>

          <SamplesAssociator
            searchTerm={searchTerm}
            selectedFastqs={selectedFastqs}
            onSelectFastq={handleAddAssociation}
            onDeselectFastq={handleDeselectFastq}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={fastqMutation.isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={fastqMutation.isUpdating}
          >
            {fastqMutation.isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
