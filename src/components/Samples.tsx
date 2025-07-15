import { Header } from "@/components/ui/header.tsx";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type { Sample } from "@/types.ts";
import data from "@fake/samples.json";
import { Outlet } from "@tanstack/react-router";

const samples: Sample[] = data;

export function Samples() {
  return (
    <>
      <Header title="Samples" subtitle="All available samples for analysis." />

      <Table>
        <TableCaption>Sample collection for virus detection.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell className="font-medium">{sample.id}</TableCell>
              <TableCell>{sample.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Outlet />
    </>
  );
}
