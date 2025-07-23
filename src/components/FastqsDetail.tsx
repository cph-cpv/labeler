import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox.tsx";
import { FastqsTypeBadge } from "@/components/FastqsTypeBadge.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { convertPbToUi, useFastqs } from "@/hooks/useFastqs.ts";
import {
  usePocketBaseCollection,
  usePocketBaseRecord,
} from "@/hooks/usePocketBaseQuery.ts";
import { pb } from "@/lib/pocketbase.ts";
import type { Fastq, Sample } from "@/types.ts";
import { useForm } from "@tanstack/react-form";
import { VisuallyHidden } from "radix-ui";
import { useCallback, useEffect, useState } from "react";

type FastqsDetailProps = {
  id: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

type FormValues = {
  quality: number;
  dilutionFactor: number;
  sample: Sample | null;
  excluded: boolean;
};

export function FastqsDetail({ id, open, onOpenChange }: FastqsDetailProps) {
  const { refetch } = useFastqs();

  const [fastq, setFastq] = useState<Fastq | null>(null);

  const { data: samples = [] } = usePocketBaseCollection<Sample>("samples");

  const {
    data: pbFile,
    error,
    isLoading,
    notFound,
  } = usePocketBaseRecord("fastqs", id, { expand: "sample" });

  const form = useForm({
    defaultValues: {
      quality: 1,
      dilutionFactor: 1,
      sample: null,
      excluded: false,
    } as FormValues,
  });

  useEffect(() => {
    const convertedFastq = convertPbToUi(pbFile);
    setFastq(convertedFastq);

    if (convertedFastq) {
      const newQuality = convertedFastq.quality || 1;
      const newDilutionFactor = convertedFastq.dilutionFactor || 1;
      let newSample: Sample | null = null;

      if (convertedFastq.sample && samples.length > 0) {
        newSample =
          samples.find((s) => s.name === convertedFastq.sample) || null;
      } else if (convertedFastq.sample === null) {
        newSample = null;
      }

      // Update form with new values
      form.setFieldValue("quality", newQuality);
      form.setFieldValue("dilutionFactor", newDilutionFactor);
      form.setFieldValue("sample", newSample);
      form.setFieldValue("excluded", convertedFastq.excluded || false);
    }
  }, [pbFile, samples, form]);

  const update = useCallback(
    async (update: Partial<Fastq>) => {
      const query: Record<string, any> = {};

      if (update.excluded !== undefined) query.excluded = update.excluded;
      if (update.type !== undefined) query.type = update.type;
      if (update.quality !== undefined) {
        query.quality_rating = update.quality;
      }

      if (update.dilutionFactor !== undefined)
        query.dilution_factor = update.dilutionFactor;

      if (update.sample !== undefined) query.sample = update.sample;

      const updated = await pb.collection("fastqs").update(id, query);

      setFastq(convertPbToUi(updated));
      refetch();
    },
    [id, refetch],
  );

  if (isLoading || !fastq) {
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
          <LoadingIndicator isLoading={isLoading} />
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

  // Handle sample assignment change
  function handleSampleChange(sample: Sample | null) {
    form.setFieldValue("sample", sample);
    update({
      sample: sample?.id || null,
    });
  }

  // Handle quality change
  function handleQualityChange(value: number[]) {
    const newQuality = value[0];
    form.setFieldValue("quality", newQuality);
    update({
      quality: newQuality,
    });
  }

  // Handle dilution factor change
  function handleDilutionFactorChange(value: number[]) {
    const newDilutionFactor = value[0];
    form.setFieldValue("dilutionFactor", newDilutionFactor);
    update({
      dilutionFactor: newDilutionFactor,
    });
  }

  // Handle excluded change
  function handleExcludedChange(checked: boolean) {
    form.setFieldValue("excluded", checked);
    update({
      excluded: checked,
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
            <form.Field
              name="sample"
              children={(field) => (
                <FastqsSampleCombobox
                  value={field.state.value}
                  onValueChange={handleSampleChange}
                  placeholder="Select or create sample..."
                />
              )}
            />
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <div className="space-y-3 prose">
              <div>
                <strong>Type:</strong> <FastqsTypeBadge type={fastq.type} />
              </div>
              <form.Field
                name="quality"
                children={(field) => (
                  <div>
                    <Label htmlFor={`quality-${id}`} className="font-bold">
                      Quality
                    </Label>
                    <div className="mt-2">
                      <Slider
                        id={`quality-${id}`}
                        value={[field.state.value]}
                        onValueChange={handleQualityChange}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              />
              <form.Field
                name="dilutionFactor"
                children={(field) => (
                  <div>
                    <Label
                      htmlFor={`dilution-factor-${id}`}
                      className="font-bold"
                    >
                      Dilution Factor
                    </Label>
                    <div className="mt-2">
                      <Slider
                        id={`dilution-factor-${id}`}
                        value={[field.state.value]}
                        onValueChange={handleDilutionFactorChange}
                        min={1}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              />
              <form.Field
                name="excluded"
                children={(field) => (
                  <div className="flex items-center gap-3">
                    <strong>Excluded:</strong>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={handleExcludedChange}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
