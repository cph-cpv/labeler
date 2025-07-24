import { FastqsSampleCombobox } from "@/components/FastqsSampleCombobox.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { convertPbToUi } from "@/hooks/useFastqs.ts";
import {
  usePocketBaseCollection,
  usePocketBaseMutation,
  usePocketBaseRecord,
} from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq, FastqType, Sample } from "@/types.ts";
import { useForm } from "@tanstack/react-form";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";

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
  type: FastqType | null;
};

export function FastqsDetail({ id, open, onOpenChange }: FastqsDetailProps) {
  const { update } = usePocketBaseMutation<any>("fastqs");

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
      type: null,
    } as FormValues,
    validators: {
      onChange: ({ value }) => {
        // Auto-update when any field changes
        const query: Record<string, any> = {};

        if (value.excluded !== undefined) query.excluded = value.excluded;
        if (value.type !== undefined) query.type = value.type;
        if (value.quality !== undefined) query.quality_rating = value.quality;
        if (value.dilutionFactor !== undefined)
          query.dilution_factor = value.dilutionFactor;
        if (value.sample !== undefined) query.sample = value.sample?.id || null;

        update(
          { id, data: query },
          {
            onSuccess: (updated) => {
              setFastq(convertPbToUi(updated));
            },
          },
        );

        return undefined; // No validation errors
      },
    },
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
      form.setFieldValue("type", convertedFastq.type);
    }
  }, [pbFile, samples, form]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fastq.name}</DialogTitle>
          <DialogDescription>FASTQ File Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-8 min-w-0">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Metadata</h3>
            <div className="space-y-4">
              <div className="min-w-0">
                <Label className="font-medium">Path</Label>
                <div className="w-full mt-2 overflow-x-auto border rounded bg-gray-100">
                  <div className="font-mono px-3 py-2 whitespace-nowrap">
                    {fastq.path}
                  </div>
                </div>
              </div>
              <div>
                <Label className="font-medium">Run Date</Label>
                <div className="mt-2">
                  {new Date(fastq.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sample</h3>
            <form.Field
              name="sample"
              children={(field) => (
                <FastqsSampleCombobox
                  value={field.state.value}
                  onValueChange={(sample) => field.handleChange(sample)}
                  placeholder="Select or create sample..."
                />
              )}
            />
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <div className="space-y-4">
              <form.Field
                name="type"
                children={(field) => (
                  <div>
                    <Label className="font-semibold">Type</Label>
                    <div className="mt-2">
                      <RadioGroup
                        value={field.state.value || ""}
                        onValueChange={(value) =>
                          field.handleChange(value as FastqType)
                        }
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dsRNA" id="dsRNA" />
                          <Label htmlFor="dsRNA">dsRNA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="smRNA" id="smRNA" />
                          <Label htmlFor="smRNA">smRNA</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Unknown" id="Unknown" />
                          <Label htmlFor="Unknown">Unknown</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              />
              <form.Field
                name="quality"
                children={(field) => (
                  <div>
                    <Label htmlFor={`quality-${id}`} className="font-semibold">
                      Quality
                    </Label>
                    <div className="mt-2">
                      <Slider
                        id={`quality-${id}`}
                        value={[field.state.value]}
                        onValueChange={(value) => field.handleChange(value[0])}
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
                      className="font-semibold"
                    >
                      Dilution Factor
                    </Label>
                    <div className="mt-2">
                      <Slider
                        id={`dilution-factor-${id}`}
                        value={[field.state.value]}
                        onValueChange={(value) => field.handleChange(value[0])}
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
                    <Label className="font-semibold">Excluded</Label>
                    <Switch
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
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
