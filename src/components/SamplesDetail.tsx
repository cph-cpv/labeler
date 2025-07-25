import { SamplesAssociator } from "@/components/SamplesAssociator.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogSectionTitle,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import {
  usePocketBaseCollection,
  usePocketBaseMutation,
} from "@/hooks/usePocketBaseQuery.ts";
import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq, Sample } from "@/types.ts";
import { useForm } from "@tanstack/react-form";
import React, { useState } from "react";

interface SamplesDetailProps {
  sample: Sample;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SamplesDetail({
  sample,
  open,
  onOpenChange,
}: SamplesDetailProps) {
  const [searchTerm, setSearchTerm] = useState(sample.name);

  // Fetch FASTQs associated with this sample (server state)
  const { data: pbFastqs, isLoading: isFastqsLoading } =
    usePocketBaseCollection<Fastq>("fastqs", {
      filter: `sample = "${sample.id}"`,
      sort: "name",
    });

  const serverAssociatedFastqs = pbFastqs
    .map(convertPbToUiFastq)
    .filter(Boolean) as Fastq[];

  // Mutation for updating FASTQs
  const fastqMutation = usePocketBaseMutation<Fastq>("fastqs");

  const form = useForm({
    defaultValues: {
      name: sample.name,
      selectedFastqs: serverAssociatedFastqs,
    },
    onSubmit: async ({ value }) => {
      const serverIds = new Set(serverAssociatedFastqs.map((f) => f.id));
      const selectedIds = new Set(value.selectedFastqs.map((f) => f.id));

      // Find FASTQs to add (in selected but not in server)
      const toAdd = value.selectedFastqs.filter((f) => !serverIds.has(f.id));

      // Find FASTQs to remove (in server but not in selected)
      const toRemove = serverAssociatedFastqs.filter(
        (f) => !selectedIds.has(f.id),
      );

      // Apply changes
      await Promise.all([
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
      ]);
    },
  });

  // Update search term when sample changes
  React.useEffect(() => {
    setSearchTerm(sample.name);
  }, [sample.name]);

  // Update form when server data changes
  React.useEffect(() => {
    form.reset({
      name: sample.name,
      selectedFastqs: serverAssociatedFastqs,
    });
  }, [serverAssociatedFastqs.map((f) => f.id).join(",")]); // Only update when IDs change

  function handleAddAssociation(fastq: Fastq) {
    const currentFastqs = form.getFieldValue("selectedFastqs");
    form.setFieldValue("selectedFastqs", [...currentFastqs, fastq]);
  }

  function handleDeselectFastq(fastqId: string) {
    const currentFastqs = form.getFieldValue("selectedFastqs");
    form.setFieldValue(
      "selectedFastqs",
      currentFastqs.filter((f) => f.id !== fastqId),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{form.getFieldValue("name") || sample.name}</DialogTitle>
          <DialogDescription>Sample Details</DialogDescription>
        </DialogHeader>
        {isFastqsLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingIndicator isLoading={true} />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <DialogSectionTitle>Fields</DialogSectionTitle>
            <div className="space-y-3">
              <form.Field name="name">
                {(field) => (
                  <div>
                    <Label htmlFor="sample-name">Name</Label>
                    <div className="mt-2">
                      <Input
                        id="sample-name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter sample name"
                        disabled={form.state.isSubmitting}
                      />
                    </div>
                  </div>
                )}
              </form.Field>

              <DialogSectionTitle>FASTQs</DialogSectionTitle>

              <Input
                id="fastq-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for FASTQs"
                disabled={form.state.isSubmitting}
              />
              <form.Field name="selectedFastqs">
                {(field) => (
                  <SamplesAssociator
                    searchTerm={searchTerm}
                    selectedFastqs={field.state.value}
                    onSelectFastq={handleAddAssociation}
                    onDeselectFastq={handleDeselectFastq}
                  />
                )}
              </form.Field>
            </div>

            <div className="flex justify-end space-x-2">
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              />
              <form.Subscribe
                selector={(state) => [state.isSubmitting, state.isDirty]}
                children={([isSubmitting, isDirty]) => (
                  <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
