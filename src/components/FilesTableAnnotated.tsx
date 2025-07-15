import {
  type BaseFilesTableProps,
  FileCheckboxCell,
  FileNameCell,
  RunDateCell,
  SampleCell,
  SelectAllCheckbox,
  TypeCell,
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

export function FilesTableAnnotated({
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
          <TableHead>Type</TableHead>
          <TableHead>Sample</TableHead>
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
            <TableCell>
              <TypeCell fastq={fastq} />
            </TableCell>
            <TableCell>
              <SampleCell />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
