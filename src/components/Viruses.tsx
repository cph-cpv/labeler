import { VirusType } from "@/components/VirusType.tsx";
import { Link } from "@/components/ui/link.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import data from "@fake/viruses.json";
import { Outlet } from "@tanstack/react-router";

const viruses = data.sort((a, b) => a.name.localeCompare(b.name));

export function Viruses() {
  return (
    <>
      <div>
        <header>
          <h1 className="font-bold text-2xl">Viruses</h1>
          <p className="font-medium text-gray-500">
            Viruses from the Virtool reference.
          </p>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viruses.map((virus) => (
              <TableRow key={virus.id}>
                <TableCell className="font-medium">
                  <Link to={`/viruses/${virus.id}`}>{virus.name}</Link>
                </TableCell>
                <TableCell>
                  <VirusType type={virus.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Outlet />
    </>
  );
}
