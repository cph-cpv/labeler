import { Check, ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import { pb } from "@/lib/pocketbase.ts";
import { cn } from "@/lib/utils.ts";
import type { Sample } from "@/types.ts";

interface FastqsSampleComboboxProps {
  value?: Sample | null;
  onValueChange: (sample: Sample | null) => void;
  placeholder?: string;
}

export function FastqsSampleCombobox({
  value,
  onValueChange,
  placeholder = "Select sample...",
}: FastqsSampleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [firstSampleName, setFirstSampleName] = React.useState("");

  const { data: samples = [], refetch } =
    usePocketBaseCollection<Sample>("samples");

  const filteredSamples = React.useMemo(() => {
    if (!searchValue) return samples;
    return samples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [samples, searchValue]);

  const exactMatch = samples.find(
    (sample) => sample.name.toLowerCase() === searchValue.toLowerCase(),
  );

  const showCreateOption = Boolean(
    searchValue &&
      searchValue.trim() &&
      !exactMatch &&
      filteredSamples.length === 0,
  );

  const handleSelect = async (selectedValue: string) => {
    if (selectedValue === "create-new") {
      if (isCreating) return;

      setIsCreating(true);
      try {
        // Create new sample in PocketBase
        const newSample = await pb.collection("samples").create<Sample>({
          name: searchValue,
        });

        // Refetch samples to update the list
        await refetch();

        // Select the newly created sample
        onValueChange(newSample);
      } catch (error) {
        console.error("Failed to create sample:", error);
      } finally {
        setIsCreating(false);
      }
    } else {
      const sample = samples.find((s) => s.name === selectedValue);
      onValueChange(sample || null);
    }
    setOpen(false);
    setSearchValue("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  const handleCreateFirstSample = async () => {
    if (!firstSampleName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newSample = await pb.collection("samples").create<Sample>({
        name: firstSampleName.trim(),
      });

      await refetch();
      onValueChange(newSample);
      setFirstSampleName("");
    } catch (error) {
      console.error("Failed to create first sample:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFirstSample();
    }
  };

  // If no samples exist, show first sample creation UI
  if (samples.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          No samples exist yet. Create your first sample to get started.
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter sample name..."
            value={firstSampleName}
            onChange={(e) => setFirstSampleName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreating}
            className="flex-1"
          />
          <Button
            onClick={handleCreateFirstSample}
            disabled={!firstSampleName.trim() || isCreating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    );
  }

  // Normal combobox when samples exist
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popper-anchor-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search samples..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredSamples.length === 0 && !showCreateOption && (
              <CommandEmpty>No samples found.</CommandEmpty>
            )}

            <CommandGroup>
              {filteredSamples.map((sample) => (
                <CommandItem
                  key={sample.id}
                  value={sample.name}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === sample.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {sample.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  value="create-new"
                  onSelect={handleSelect}
                  className="cursor-pointer bg-green-50 text-green-800 hover:bg-green-100 mx-2 my-1 rounded-md border-t border-green-200"
                  disabled={isCreating}
                >
                  <Plus className="mr-2 h-4 w-4 text-green-600" />
                  {isCreating
                    ? `Creating "${searchValue}"...`
                    : `Create new sample "${searchValue}"`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
