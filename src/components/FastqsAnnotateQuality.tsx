import { FastqsAnnotateSelection } from "@/components/FastqsAnnotateSelection.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DialogSectionTitle } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { TableMissingIcon } from "@/components/ui/table-missing-icon.tsx";
import { TabsContent } from "@/components/ui/tabs.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { validateQuality } from "@/lib/utils.ts";
import type { Fastq, FastqUpdate } from "@/types.ts";

type FastqsAnnotateQualityProps = {
  selectedItems: Fastq[];
};

export function FastqsAnnotateQuality({
  selectedItems,
}: FastqsAnnotateQualityProps) {
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<FastqUpdate>("fastqs");

  return (
    <TabsContent value="quality" className="space-y-3">
      <DialogSectionTitle>Quality</DialogSectionTitle>

      <div>
        <Label className="font-semibold">
          Set quality for all selected FASTQs:
        </Label>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((quality) => (
            <Button
              key={quality}
              type="button"
              variant="outline"
              onClick={async () => {
                const updates = selectedItems.map((fastq) => ({
                  id: fastq.id,
                  data: { quality: validateQuality(quality) },
                }));
                console.log({ updates });
                await batchUpdateAsync({ updates });
              }}
              className="min-w-[40px]"
            >
              {quality}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                const updates = selectedItems.map((fastq) => ({
                  id: fastq.id,
                  data: { quality: null },
                }));
                console.log("Batch updating quality to null:", updates);
                await batchUpdateAsync({ updates });
                console.log("Batch update completed");
              } catch (error) {
                console.error("Batch update failed:", error);
              }
            }}
            className="flex items-center gap-2"
          >
            <TableMissingIcon />
            Unset
          </Button>
        </div>
      </div>

      <FastqsAnnotateSelection
        selectedItems={selectedItems}
        fieldExtractor={(fastq) => fastq.quality}
        fieldValueFormatter={(value) => (value ? `${value}` : "Unset")}
      />
    </TabsContent>
  );
}
