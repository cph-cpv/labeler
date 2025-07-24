import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Link } from "@/components/ui/link.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";
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
import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Sample } from "@/types.ts";
import { Outlet } from "@tanstack/react-router";
import React, { useEffect } from "react";

export function Samples() {
  const {
    data: samples = [],
    isLoading,
    error,
  } = usePocketBaseCollection<Sample>("samples");

  const [searchValue, setSearchValue] = React.useState("");
  const [labelDialogOpen, setLabelDialogOpen] = React.useState(false);

  const filteredSamples = React.useMemo(() => {
    if (!searchValue) return samples;
    return samples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [samples, searchValue]);

  const {
    isAllSelected,
    onSelectAll,
    onSetItems,
    onToggle,
    selectedIds,
    selectedCount,
    onClearSelection,
  } = useSelection<Sample>();

  // Set the samples in the selection context when they change
  useEffect(() => {
    if (filteredSamples) {
      onSetItems(filteredSamples);
    }
  }, [filteredSamples, onSetItems]);

  if (isLoading) {
    return (
      <>
        <Header
          title="Samples"
          subtitle="All available samples for analysis."
        />
        <div className="text-center py-8">Loading samples...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          title="Samples"
          subtitle="All available samples for analysis."
        />
        <div className="text-center py-8 text-red-600">
          Error loading samples: {error.message}
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Samples" subtitle="All available samples for analysis." />

      <div className="mb-4">
        <Input
          placeholder="Search samples by name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <Table>
        <TableCaption>Sample collection for virus detection.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <SelectAllCheckbox
                isAllSelected={isAllSelected}
                items={filteredSamples}
                onSelectAll={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSamples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell>
                <SelectionCheckbox
                  item={sample}
                  selectedItems={selectedIds}
                  onItemSelect={(item, event) => onToggle(item.id, event)}
                  getItemLabel={(item) => item.name}
                />
              </TableCell>
              <TableCell>
                <Link
                  from="/samples"
                  to="/samples/$id"
                  params={{ id: sample.id }}
                >
                  {sample.name}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCount > 0 && (
        <SelectionBar
          selectedCount={selectedCount}
          itemName="sample"
          onClearSelection={onClearSelection}
        >
          <Dialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Label</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Label Samples</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p>
                  Label {selectedCount} selected sample
                  {selectedCount === 1 ? "" : "s"}.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </SelectionBar>
      )}

      <Outlet />
    </>
  );
}
