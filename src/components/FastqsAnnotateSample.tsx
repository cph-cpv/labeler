import { FastqsAnnotateSelection } from "@/components/FastqsAnnotateSelection.tsx";
import { FastqsSampleSelector } from "@/components/FastqsSampleSelector.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DialogSectionTitle } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { TableMissingIcon } from "@/components/ui/table-missing-icon.tsx";
import { TabsContent } from "@/components/ui/tabs.tsx";
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types.ts";
import { useState } from "react";

type FastqsAnnotateSampleProps = {
  selectedItems: Fastq[];
};

export function FastqsAnnotateSample({
  selectedItems,
}: FastqsAnnotateSampleProps) {
  const { update } = usePocketBaseMutation<any>("fastqs");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  return (
    <TabsContent value="sample" className="space-y-3">
      <DialogSectionTitle>Sample Information</DialogSectionTitle>
      <div className="space-y-3">
        <Label className="font-semibold">
          Set sample for all selected FASTQs
        </Label>
        <FastqsSampleSelector
          value={selectedSample}
          onValueChange={(sample) => {
            setSelectedSample(sample);
            if (sample) {
              const updates = selectedItems.map((fastq) =>
                update({
                  id: fastq.id,
                  data: { sample: sample.name },
                }),
              );
              Promise.all(updates);
            }
          }}
          placeholder="Select or create a sample..."
          fastqNames={selectedItems.map((fastq) => fastq.name)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            const updates = selectedItems.map((fastq) =>
              update({
                id: fastq.id,
                data: { sample: null },
              }),
            );
            await Promise.all(updates);
            setSelectedSample(null);
          }}
          className="flex items-center gap-2"
        >
          <TableMissingIcon />
          Unset sample
        </Button>
      </div>

      <FastqsAnnotateSelection
        selectedItems={selectedItems}
        fieldExtractor={(fastq) => fastq.sample}
      />
    </TabsContent>
  );
}
