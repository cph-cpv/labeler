import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqType } from "@/types";
import React from "react";

type FastqsTypeSingleProps = {
  fastq: Fastq | null;
  isOpen: boolean;
  onClose: () => void;
};

const FASTQ_TYPES: { value: FastqType | "null"; label: string }[] = [
  { value: "null", label: "No type" },
  { value: "dsRNA", label: "dsRNA" },
  { value: "smRNA", label: "smRNA" },
  { value: "Unknown", label: "Unknown" },
];

export function FastqsTypeSingle({
  fastq,
  isOpen,
  onClose,
}: FastqsTypeSingleProps) {
  const [selectedType, setSelectedType] = React.useState<string>("null");

  const { update, isUpdating } = usePocketBaseMutation<Fastq>("fastqs");

  // Initialize selected type when dialog opens
  React.useEffect(() => {
    if (fastq && isOpen) {
      setSelectedType(fastq.type || "null");
    }
  }, [fastq, isOpen]);

  function handleTypeChange(value: string) {
    setSelectedType(value);
    if (fastq) {
      const typeValue = value === "null" ? null : (value as FastqType);
      update(
        { id: fastq.id, data: { type: typeValue } },
        {
          onSuccess: () => {
            // Keep dialog open for multiple edits
          },
          onError: (error) => {
            console.error("Failed to update type:", error);
          },
        },
      );
    }
  }

  if (!fastq) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Type Assignment</DialogTitle>
          <DialogDescription>
            Assign a type to <strong>{fastq.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={handleTypeChange}
              disabled={isUpdating}
            >
              {FASTQ_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={type.value}
                    id={`type-${type.value}`}
                    disabled={isUpdating}
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className={
                      type.value === "null" ? "text-muted-foreground" : ""
                    }
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
