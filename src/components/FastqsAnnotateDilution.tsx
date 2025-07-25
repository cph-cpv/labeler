import { FastqsAnnotateSelection } from "@/components/FastqsAnnotateSelection.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DialogSectionTitle } from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { TableMissingIcon } from "@/components/ui/table-missing-icon.tsx";
import { TabsContent } from "@/components/ui/tabs.tsx";
import { usePocketBaseBatchUpdate } from "@/hooks/usePocketBaseQuery.ts";
import { DILUTIONS, formatDilution, parseDilution } from "@/lib/dilution.ts";
import type { Fastq } from "@/types.ts";

type FastqsAnnotateDilutionProps = {
  selectedItems: Fastq[];
};

export function FastqsAnnotateDilution({
  selectedItems,
}: FastqsAnnotateDilutionProps) {
  const { batchUpdateAsync } = usePocketBaseBatchUpdate<Fastq>("fastqs");

  return (
    <TabsContent value="dilution" className="space-y-3">
      <DialogSectionTitle>Dilution Factor</DialogSectionTitle>

      <div>
        <Label className="font-semibold">
          Set dilution factor for all selected FASTQs:
        </Label>
        <div className="mt-3 flex items-center gap-2">
          <Select
            onValueChange={async (value) => {
              const dilution = parseDilution(value);
              const updates = selectedItems.map((fastq) => ({
                id: fastq.id,
                data: { dilution },
              }));
              await batchUpdateAsync({ updates });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select dilution..." />
            </SelectTrigger>
            <SelectContent>
              {DILUTIONS.map((dilution) => (
                <SelectItem key={dilution} value={dilution}>
                  {formatDilution(dilution)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const updates = selectedItems.map((fastq) => ({
                id: fastq.id,
                data: { dilution: null },
              }));
              await batchUpdateAsync({ updates });
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
        fieldExtractor={(fastq) =>
          fastq.dilution !== null ? formatDilution(fastq.dilution) : "Unset"
        }
      />
    </TabsContent>
  );
}
