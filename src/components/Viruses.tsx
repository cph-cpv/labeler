import { VirusSelection } from "@/components/VirusSelection.tsx";
import { VirusType } from "@/components/VirusType.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Link } from "@/components/ui/link.tsx";
import {
  SelectAllCheckbox,
  SelectionCheckbox,
} from "@/components/ui/selection-checkbox.tsx";
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
import { useSelection } from "@/hooks/useSelection.ts";
import data from "@fake/viruses.json";
import { Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const viruses = data.sort((a, b) => a.name.localeCompare(b.name));

export function Viruses() {
  const [activeTab, setActiveTab] = useState("all");

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

  const {
    selectedItems: selectedViruses,
    selectedCount,
    isAllSelected,
    handleItemSelect: handleVirusSelect,
    handleSelectAll,
    clearSelection,
  } = useSelection(currentViruses);

  const renderVirusTable = (virusList: typeof viruses) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <SelectAllCheckbox
              items={virusList}
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {virusList.map((virus) => (
          <TableRow key={virus.id}>
            <TableCell>
              <SelectionCheckbox
                item={virus}
                selectedItems={selectedViruses}
                onItemSelect={handleVirusSelect}
                getItemLabel={(item) => item.name}
              />
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

      <VirusSelection
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
      />

      <Outlet />
    </>
  );
}
