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
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Sample } from "@/types.ts";
import { useEffect, useState } from "react";

type SamplesNameEditProps = {
  sample: Sample | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SampleName({ sample, isOpen, onClose }: SamplesNameEditProps) {
  const [name, setName] = useState("");

  const sampleMutation = usePocketBaseMutation<Sample>("samples");

  useEffect(() => {
    if (sample) {
      setName(sample.name);
    }
  }, [sample]);

  async function handleSave() {
    if (!sample || !name.trim()) return;

    await sampleMutation.updateAsync({
      id: sample.id,
      data: { name: name.trim() },
    });

    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  if (!sample) return null;

  const hasChanges = name.trim() !== sample.name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sample Name</DialogTitle>
          <DialogDescription>
            Change the name for this sample.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sample-name">Sample Name</Label>
            <Input
              id="sample-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter sample name"
              disabled={sampleMutation.isUpdating}
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
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
            disabled={sampleMutation.isUpdating || !hasChanges || !name.trim()}
          >
            {sampleMutation.isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
