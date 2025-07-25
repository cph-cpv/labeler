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
import { usePocketBaseMutation } from "@/hooks/usePocketBaseQuery.ts";
import type { Fastq } from "@/types.ts";

type FastqsAnnotateTypeProps = {
  selectedItems: Fastq[];
};

export function FastqsAnnotateType({ selectedItems }: FastqsAnnotateTypeProps) {
  const { update } = usePocketBaseMutation<any>("fastqs");

  return (
    <TabsContent value="type" className="space-y-3">
      <DialogSectionTitle>Type</DialogSectionTitle>

      <div>
        <Label className="font-semibold">
          Set type for all selected FASTQs:
        </Label>
        <div className="mt-3 flex gap-3 items-center">
          <Select
            onValueChange={async (value) => {
              const updates = selectedItems.map((fastq) =>
                update({ id: fastq.id, data: { type: value } }),
              );
              await Promise.all(updates);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dsRNA">dsRNA</SelectItem>
              <SelectItem value="smRNA">smRNA</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const updates = selectedItems.map((fastq) =>
                update({ id: fastq.id, data: { type: null } }),
              );
              await Promise.all(updates);
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
        fieldExtractor={(fastq) => fastq.type}
      />
    </TabsContent>
  );
}
