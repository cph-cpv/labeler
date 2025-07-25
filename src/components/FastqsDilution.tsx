import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import { isValidDilution, parseDilution } from "@/lib/dilution.ts";
import type { Fastq } from "@/types";
import { VisuallyHidden } from "radix-ui";
import React from "react";

type FastqsDilutionSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

export function FastqsDilution({
  fastq,
  isOpen,
  onClose,
}: FastqsDilutionSingleProps) {
  const [dilutionValue, setDilutionValue] = React.useState<string>("");
  const [isValid, setIsValid] = React.useState<boolean>(true);

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize dilution value when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      setDilutionValue(fastq.dilution || "");
      setIsValid(true);
    }
  }, [fastq, isOpen]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setDilutionValue(value);
    setIsValid(value === "" || isValidDilution(value));
  }

  function handleSave() {
    if (!fastq || !isValid) return;

    const dilution = parseDilution(dilutionValue);

    update(
      { id: fastq.id, data: { dilution } },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error("Failed to update dilution factor:", error);
        },
      },
    );
  }

  function handleClear() {
    if (!fastq) return;

    update(
      { id: fastq.id, data: { dilution: null } },
      {
        onSuccess: () => {
          setDilutionValue("");
          onClose();
        },
        onError: (error) => {
          console.error("Failed to clear dilution factor:", error);
        },
      },
    );
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && isValid) {
      event.preventDefault();
      handleSave();
    }
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>Edit Dilution Factor</DialogTitle>
            <DialogDescription>
              Set dilution factor for <strong>{fastq.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dilution-input" className="text-sm font-medium">
              Dilution Factor
            </Label>
            <Input
              id="dilution-input"
              type="text"
              value={dilutionValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter dilution factor (e.g., 10)"
              disabled={isUpdating}
              className={!isValid ? "border-red-500" : ""}
            />
            {!isValid && (
              <p className="text-sm text-red-500">
                Please enter a valid dilution factor (1, 2, 10, 20, 25, 50, 100,
                or 200)
              </p>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isUpdating}
            >
              Clear
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isUpdating || !isValid}
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
