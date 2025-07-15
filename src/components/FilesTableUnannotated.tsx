import {
  type BaseFilesTableProps,
  FileCheckboxCell,
  FileNameCell,
  RunDateCell,
  SelectAllCheckbox,
} from "@/components/FilesTableCommon.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

export function FilesTableUnannotated({
  fastqs,
  selectedFiles,
  onFileSelect,
  onSelectAll,
}: BaseFilesTableProps) {
  return (
    <Table className="table">
      <TableCaption>All available FASTQ files.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <SelectAllCheckbox
              selectedFiles={selectedFiles}
              fastqs={fastqs}
              onSelectAll={onSelectAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Run Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fastqs.map((fastq) => (
          <TableRow key={fastq.id}>
            <TableCell>
              <FileCheckboxCell
                fastq={fastq}
                selectedFiles={selectedFiles}
                onFileSelect={onFileSelect}
              />
            </TableCell>
            <TableCell>
              <FileNameCell fastq={fastq} />
            </TableCell>
            <TableCell>
              <RunDateCell fastq={fastq} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
