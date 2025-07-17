import { VirusType } from "@/components/VirusType.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "@/components/ui/link.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { cn } from "@/utils.ts";
import data from "@fake/viruses.json";
import { Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const viruses = data.sort((a, b) => a.name.localeCompare(b.name));

export function Viruses() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedViruses, setSelectedViruses] = useState<Set<string>>(
    new Set(),
  );

  const { allViruses, typedViruses, untypedViruses } = useMemo(() => {
    return {
      allViruses: viruses,
      typedViruses: viruses.filter((virus) => virus.type !== null),
      untypedViruses: viruses.filter((virus) => virus.type === null),
    };
  }, []);

  const currentViruses = useMemo(() => {
    switch (activeTab) {
      case "typed":
        return typedViruses;
      case "untyped":
        return untypedViruses;
      default:
        return allViruses;
    }
  }, [activeTab, allViruses, typedViruses, untypedViruses]);

  const handleVirusSelect = (virusId: string) => {
    setSelectedViruses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(virusId)) {
        newSet.delete(virusId);
      } else {
        newSet.add(virusId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedViruses.size === currentViruses.length) {
      setSelectedViruses(new Set());
    } else {
      setSelectedViruses(new Set(currentViruses.map((v) => v.id.toString())));
    }
  };

  const renderVirusTable = (virusList: typeof viruses) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <label className="flex items-center justify-center cursor-pointer p-2">
              <input
                type="checkbox"
                checked={
                  selectedViruses.size === virusList.length &&
                  virusList.length > 0
                }
                onChange={handleSelectAll}
                className="rounded"
                aria-label="Select all viruses"
              />
            </label>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {virusList.map((virus) => (
          <TableRow key={virus.id}>
            <TableCell>
              <label className="flex items-center justify-center cursor-pointer p-2">
                <input
                  type="checkbox"
                  checked={selectedViruses.has(virus.id.toString())}
                  onChange={() => handleVirusSelect(virus.id.toString())}
                  className="rounded"
                  aria-label={`Select ${virus.name}`}
                />
              </label>
            </TableCell>
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
  );

  return (
    <>
      <div>
        <header>
          <h1 className="font-bold text-2xl">Viruses</h1>
          <p className="font-medium text-gray-500">
            Viruses from the Virtool reference.
          </p>
        </header>
        <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All{" "}
              <Badge variant={activeTab === "all" ? "default" : "outline"}>
                {allViruses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="typed">
              Typed{" "}
              <Badge variant={activeTab === "typed" ? "default" : "outline"}>
                {typedViruses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="untyped">
              Untyped{" "}
              <Badge variant={activeTab === "untyped" ? "default" : "outline"}>
                {untypedViruses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderVirusTable(allViruses)}</TabsContent>
          <TabsContent value="typed">
            {renderVirusTable(typedViruses)}
          </TabsContent>
          <TabsContent value="untyped">
            {renderVirusTable(untypedViruses)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Selection UI */}
      <div
        className={cn(
          "fixed",
          "bottom-0",
          "left-0",
          "right-0",
          "z-50",
          "bg-stone-50",
          "border-t-2",
          "shadow-lg",
          "transition-transform",
          "duration-300",
          "ease-in-out",
          "scrollbar-gutter-stable",
          selectedViruses.size > 0 ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-medium">
              {selectedViruses.size}{" "}
              {selectedViruses.size === 1 ? "virus" : "viruses"} selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedViruses(new Set())}
              >
                Clear Selection
              </Button>
              <Button variant="outline">Export Selected</Button>
            </div>
          </div>
        </div>
      </div>

      <Outlet />
    </>
  );
}
