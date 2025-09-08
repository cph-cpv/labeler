import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { BaseSample, Sample } from "@/types.ts";
import { useEffect, useState } from "react";

type SampleNameProps = {
  sample: Sample | null;
  trigger: React.ReactNode;
};

export function SampleName({ sample, trigger }: SampleNameProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const { update, isUpdating } = usePocketBaseMutation<BaseSample>("samples");

  useEffect(() => {
    if (sample) {
      setName(sample.name);
    }
  }, [sample]);

  async function handleSave() {
    if (!sample || !name.trim()) return;

    update(
      {
        id: sample.id,
        data: { name: name.trim() },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
        onError: (error) => {
          console.error("Failed to update sample name:", error);
        },
      },
    );
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  if (!sample) return null;

  const hasChanges = name.trim() !== sample.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit Sample Name</h4>
            <p className="text-sm text-muted-foreground">
              Change the name for <strong>{sample.name}</strong>
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="sample-name" className="text-sm font-medium">
              Sample Name
            </Label>
            <Input
              id="sample-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter sample name"
              disabled={isUpdating}
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isUpdating || !hasChanges || !name.trim()}
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
