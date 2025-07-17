import { FilesSampleCombobox } from "@/components/FilesSampleCombobox.tsx";
import { FilesTypeBadge } from "@/components/FilesTypeBadge.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import type { Fastq, Sample } from "@/types.ts";
import { useState } from "react";

interface FilesDetailProps {
  fastq: Fastq;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilesDetail({ fastq, open, onOpenChange }: FilesDetailProps) {
  const [quality, setQuality] = useState<number[]>([fastq.quality || 1]);
  const [dilutionFactor, setDilutionFactor] = useState<number[]>([
    fastq.dilutionFactor || 1,
  ]);

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

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
              <FilesSampleCombobox
                value={selectedSample}
                onValueChange={setSelectedSample}
                placeholder="Select or create sample..."
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <div className="space-y-3 prose">
              <div>
                <strong>Type:</strong> <FilesTypeBadge type={fastq.type} />
              </div>
              <div>
                <strong>Quality:</strong>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium">{quality[0]}</span>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
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
                    onValueChange={(value) =>
                      setDilutionFactor([value[0] === 0 ? 1 : value[0]])
                    }
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
