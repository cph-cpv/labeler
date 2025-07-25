import { SamplesAssociator } from "@/components/SamplesAssociator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CreateMore } from "@/components/ui/create-more.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, Sample } from "@/types.ts";
import React from "react";

type SamplesCreateProps = {
  onSampleCreated?: () => void;
};

type PocketBaseFile = {
  id: string;
  sample: string | null;
};

export function SamplesCreate({ onSampleCreated }: SamplesCreateProps) {
  const [open, setOpen] = React.useState(false);
  const [sampleName, setSampleName] = React.useState("");
  const [selectedFastqs, setSelectedFastqs] = React.useState<Fastq[]>([]);
  const [createMore, setCreateMore] = React.useState(false);

  // Mutations for creating sample and updating FASTQs
  const sampleMutation = usePocketBaseMutation<Sample>("samples");
  const fastqMutation = usePocketBaseMutation<PocketBaseFile>("fastqs");

  const isCreating = sampleMutation.isCreating || fastqMutation.isUpdating;

  function handleSelectFastq(fastq: Fastq) {
    setSelectedFastqs((prev) => [...prev, fastq]);
  }

  function handleDeselectFastq(fastqId: string) {
    setSelectedFastqs((prev) => prev.filter((f) => f.id !== fastqId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sampleName.trim() || selectedFastqs.length === 0) return;

    try {
      // Create the sample first
      const createdSample = await sampleMutation.createAsync({
        name: sampleName.trim(),
      });

      // Update all selected FASTQs to associate them with the created sample
      await Promise.all(
        selectedFastqs.map((fastq) =>
          fastqMutation.updateAsync({
            id: fastq.id,
            data: { sample: createdSample.id },
          }),
        ),
      );

      // Reset form
      setSampleName("");
      setSelectedFastqs([]);

      // Close dialog only if createMore is false
      if (!createMore) {
        setOpen(false);
      }

      // Notify parent component
      onSampleCreated?.();
    } catch (error) {
      console.error("Failed to create sample:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Sample</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Sample</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Create a new sample and associate it with FASTQ files.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sample-name">Sample Name</Label>
            <Input
              id="sample-name"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="Enter sample name..."
              disabled={isCreating}
            />
            <SamplesAssociator
              searchTerm={sampleName}
              selectedFastqs={selectedFastqs}
              onSelectFastq={handleSelectFastq}
              onDeselectFastq={handleDeselectFastq}
              blocked={
                sampleName.length < 4
                  ? "Type at least 4 characters to search for matching FASTQs"
                  : undefined
              }
              className="mt-4"
            />
          </div>
          <div className="flex justify-between items-center">
            <CreateMore checked={createMore} onCheckedChange={setCreateMore} />
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating ||
                  !sampleName.trim() ||
                  selectedFastqs.length === 0
                }
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
