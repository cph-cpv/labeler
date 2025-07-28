import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

export function Exceptions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>FASTQ</TableHead>
          <TableHead>Virus</TableHead>
          <TableHead>Exception</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{/* Exception data will be populated here */}</TableBody>
    </Table>
  );
}
