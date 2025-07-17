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
import type { Fastq } from "@/types.ts";
import { formatDate } from "@/utils";

interface FilesTableProps {
  fastqs: Fastq[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onSelectAll: () => void;
}

export function FilesTable({
  fastqs,
  selectedFiles,
  onFileSelect,
  onSelectAll,
}: FilesTableProps) {
  return (
    <Table className="table">
      <TableCaption>All available FASTQ files.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <SelectAllCheckbox
              items={fastqs}
              isAllSelected={
                selectedFiles.size === fastqs.length && fastqs.length > 0
              }
              onSelectAll={onSelectAll}
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
                selectedItems={selectedFiles}
                onItemSelect={onFileSelect}
                getItemLabel={(item) => item.name}
              />
            </TableCell>
            <TableCell>
              <Link to="/files/$id" params={{ id: fastq.id.toString() }}>
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
              <UnknownText>Unassigned</UnknownText>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
