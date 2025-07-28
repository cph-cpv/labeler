import { SamplesAssociator } from "@/components/SamplesAssociator.tsx";
import { SamplesLabeler } from "@/components/SamplesLabeler.tsx";
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
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  usePocketBaseCollection,
  usePocketBaseMutation,
} from "@/hooks/usePocketBaseQuery.ts";
import { convertPbToUiFastq } from "@/lib/convert.ts";
import type { Fastq, Sample, Virus } from "@/types.ts";
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
  const [selectedViruses, setSelectedViruses] = useState<Virus[]>([]);

  // Fetch FASTQs associated with this sample (server state)
  const { data: pbFastqs, isLoading: isFastqsLoading } =
    usePocketBaseCollection<Fastq>("fastqs", {
      filter: `sample = "${sample.id}"`,
      sort: "name",
    });

  const serverAssociatedFastqs = pbFastqs
    .map(convertPbToUiFastq)
    .filter(Boolean) as Fastq[];

  // Mutations for updating FASTQs and samples
  const fastqMutation = usePocketBaseMutation<Fastq>("fastqs");
  const sampleMutation = usePocketBaseMutation<Sample>("samples");

  const form = useForm({
    defaultValues: {
      name: sample.name,
      selectedFastqs: serverAssociatedFastqs,
    },
    onSubmit: async ({ value }) => {
      const promises = [];

      // Update sample name if changed
      if (value.name !== sample.name) {
        promises.push(
          sampleMutation.updateAsync({
            id: sample.id,
            data: { name: value.name },
          }),
        );
      }

      // Update virus associations
      const virusIds = selectedViruses.map((v) => v.id);
      if (JSON.stringify(virusIds) !== JSON.stringify(sample.viruses || [])) {
        promises.push(
          sampleMutation.updateAsync({
            id: sample.id,
            data: { viruses: virusIds },
          }),
        );
      }

      // Handle FASTQ associations
      const serverIds = new Set(serverAssociatedFastqs.map((f) => f.id));
      const selectedIds = new Set(value.selectedFastqs.map((f) => f.id));

      // Find FASTQs to add (in selected but not in server)
      const toAdd = value.selectedFastqs.filter((f) => !serverIds.has(f.id));

      // Find FASTQs to remove (in server but not in selected)
      const toRemove = serverAssociatedFastqs.filter(
        (f) => !selectedIds.has(f.id),
      );

      // Add FASTQ update promises
      promises.push(
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
      );

      // Execute all updates
      await Promise.all(promises);
    },
  });

  // Update search term when sample changes
  React.useEffect(() => {
    setSearchTerm(sample.name);
  }, [sample.name]);

  // Initialize selected viruses from sample data
  React.useEffect(() => {
    if (sample.viruses) {
      // Here we would need to fetch virus details if we have virus IDs
      // For now, assume selectedViruses are managed properly
      setSelectedViruses([]);
    }
  }, [sample.viruses]);

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

  function handleVirusSelect(virus: Virus) {
    setSelectedViruses((prev) => [...prev, virus]);
  }

  function handleVirusRemove(virus: Virus) {
    setSelectedViruses((prev) => prev.filter((v) => v.id !== virus.id));
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
            </div>

            <Tabs defaultValue="viruses" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="viruses">Viruses</TabsTrigger>
                <TabsTrigger value="fastqs">FASTQs</TabsTrigger>
              </TabsList>
              <TabsContent value="viruses" className="space-y-3">
                <SamplesLabeler
                  selectedViruses={selectedViruses}
                  onVirusSelect={handleVirusSelect}
                  onVirusRemove={handleVirusRemove}
                />
              </TabsContent>
              <TabsContent value="fastqs" className="space-y-3">
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
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <form.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => {
                  const isAnyMutationPending =
                    isSubmitting ||
                    sampleMutation.isPending ||
                    fastqMutation.isPending;

                  return (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isAnyMutationPending}
                    >
                      Cancel
                    </Button>
                  );
                }}
              />
              <form.Subscribe
                selector={(state) => [state.isSubmitting, state.isDirty]}
                children={([isSubmitting, isDirty]) => {
                  // Check if virus selections have changed
                  const virusIds = selectedViruses.map((v) => v.id);
                  const virusesChanged =
                    JSON.stringify(virusIds) !==
                    JSON.stringify(sample.viruses || []);

                  const hasChanges = isDirty || virusesChanged;
                  const isAnyMutationPending =
                    isSubmitting ||
                    sampleMutation.isPending ||
                    fastqMutation.isPending;

                  return (
                    <Button
                      type="submit"
                      disabled={isAnyMutationPending || !hasChanges}
                    >
                      {isAnyMutationPending ? "Saving..." : "Save Changes"}
                    </Button>
                  );
                }}
              />
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
