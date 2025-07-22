import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox.tsx";
import { FastqsTypeBadge } from "@/components/FastqsTypeBadge.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { useFastq } from "@/hooks/useFastqs.ts";
import { usePocketBaseCollection } from "@/hooks/usePocketBase.ts";
import type { Sample } from "@/types.ts";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";

type FastqsDetailProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FastqsDetail({ id, open, onOpenChange }: FastqsDetailProps) {
  const { fastq, isLoading, error, notFound, update } = useFastq(id);
  const [quality, setQuality] = useState<number[]>([1]);
  const [dilutionFactor, setDilutionFactor] = useState<number[]>([1]);
  const [sample, setSample] = useState<Sample | null>(null);
  const { data: samples = [] } = usePocketBaseCollection<Sample>("samples");

  useEffect(() => {
    if (fastq) {
      const newQuality = fastq.quality || 1;
      const newDilutionFactor = fastq.dilutionFactor || 1;

      // Only update state if values have actually changed
      if (quality[0] !== newQuality) {
        setQuality([newQuality]);
      }

      if (dilutionFactor[0] !== newDilutionFactor) {
        setDilutionFactor([newDilutionFactor]);
      }

      if (fastq.sample && samples.length > 0) {
        const foundSample = samples.find((s) => s.name === fastq.sample);
        if (sample?.name !== foundSample?.name) {
          setSample(foundSample || null);
        }
      } else if (fastq.sample === null && sample !== null) {
        setSample(null);
      }
    }
  }, [fastq, samples]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading FASTQ File</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>
                Please wait while the file details are loaded.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (notFound) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>FASTQ File Not Found</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>
                The requested FASTQ file could not be found.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>
          <div>Error loading file: File not found.</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>FASTQ File Error</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>
                An error occurred while loading the FASTQ file.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>
          <div>Error loading file: {error.message}</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (fastq === null) {
    throw new Error("fastq is null");
  }

  // Handle sample assignment change
  function handleSampleChange(sample: Sample | null) {
    update({
      sample: sample?.id || null,
    });
  }

  // Handle quality change
  function handleQualityChange(value: number[]) {
    update({
      quality: value[0],
    });
  }

  // Handle dilution factor change
  function handleDilutionFactorChange(value: number[]) {
    const adjustedValue = [value[0] === 0 ? 1 : value[0]];
    setDilutionFactor(adjustedValue);
    update({
      dilutionFactor: adjustedValue[0],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fastq.name}</DialogTitle>
          <DialogDescription>FASTQ File Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Non-editable fields */}
          <div className="space-y-3 prose">
            <div>
              <strong>Path:</strong>{" "}
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {fastq.path}
              </span>
            </div>
            <div>
              <strong>Run Date:</strong>{" "}
              {new Date(fastq.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Sample section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sample</h3>
            <div>
              <FastqsSampleCombobox
                value={sample}
                onValueChange={handleSampleChange}
                placeholder="Select or create sample..."
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <div className="space-y-3 prose">
              <div>
                <strong>Type:</strong> <FastqsTypeBadge type={fastq.type} />
              </div>
              <div>
                <strong>Quality:</strong>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium">{quality[0]}</span>
                  <Slider
                    value={quality}
                    onValueChange={handleQualityChange}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">5</span>
                </div>
              </div>
              <div>
                <strong>Dilution Factor:</strong>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium">
                    {dilutionFactor[0]}
                  </span>
                  <Slider
                    value={dilutionFactor}
                    onValueChange={handleDilutionFactorChange}
                    min={0}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">100</span>
                </div>
              </div>
              <div>
                <strong>Excluded:</strong> {fastq.excluded ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
