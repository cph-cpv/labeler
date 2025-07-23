import { Link } from "@/components/ui/link.tsx";
import {
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { UnknownText } from "@/components/ui/unknown-text.tsx";
import { useSelectionContext } from "@/contexts/SelectionContext.tsx";
import { formatDate } from "@/lib/utils.ts";
import type { Fastq } from "@/types.ts";

type FastqsTableProps = {
  fastqs: Fastq[];
};

export function FastqsTable({ fastqs }: FastqsTableProps) {
  const { selectedIds, toggleItem, selectAll, isAllSelected } =
    useSelectionContext<Fastq>();

  return (
    <Table className="table">
      <TableCaption>All available FASTQs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <SelectAllCheckbox
              items={fastqs}
              isAllSelected={isAllSelected(fastqs)}
              onSelectAll={() => selectAll(fastqs)}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Run Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Sample</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fastqs.map((fastq) => (
          <TableRow key={fastq.id}>
            <TableCell>
              <SelectionCheckbox
                item={fastq}
                selectedItems={selectedIds}
                onItemSelect={(_, event) => toggleItem(fastq, event)}
                getItemLabel={(item) => item.name}
              />
            </TableCell>
            <TableCell>
              <Link to="/fastqs/$id" params={{ id: fastq.id }}>
                {fastq.name}
              </Link>
            </TableCell>
            <TableCell>
              <span>{formatDate(fastq.timestamp)}</span>
            </TableCell>
            <TableCell>
              {fastq.type || <UnknownText>Unknown</UnknownText>}
            </TableCell>
            <TableCell>
              {fastq.sample || <UnknownText>Unassigned</UnknownText>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
