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
import {
  usePocketBaseMutation,
  usePocketBasePaginated,
} from "@/hooks/usePocketBaseQuery.ts";
import { cn } from "@/lib/utils.ts";
import type { Sample } from "@/types.ts";

type FastqsSampleComboboxProps = {
  onValueChange: (sample: Sample | null) => void;
  placeholder?: string;
  value?: Sample | null;
};

export function FastqsSampleCombobox({
  value,
  onValueChange,
  placeholder = "Search or select a sample...",
}: FastqsSampleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const [firstSampleName, setFirstSampleName] = React.useState("");

  // Use paginated query for better performance - fetch 50 samples (app default)
  const { data: allSamples = [], totalItems = 0 } =
    usePocketBasePaginated<Sample>("samples", {
      sort: "name", // Sort alphabetically for better UX
    });
  const { create } = usePocketBaseMutation<Sample>("samples");

  const filteredSamples = React.useMemo(() => {
    // Client-side filtering on the fetched subset
    if (!searchValue) {
      return allSamples;
    }
    return allSamples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [allSamples, searchValue]);

  const exactMatch = allSamples.find(
    (sample) => sample.name.toLowerCase() === searchValue.toLowerCase(),
  );

  const showCreateOption = Boolean(
    searchValue &&
      searchValue.trim() &&
      !exactMatch &&
      filteredSamples.length === 0,
  );

  async function handleSelect(selectedValue: string) {
    if (selectedValue === "create-new") {
      if (isCreating) return;

      setIsCreating(true);
      try {
        // Create new sample using mutation hook
        create(
          { name: searchValue },
          {
            onSuccess: (newSample) => {
              // Select the newly created sample
              onValueChange(newSample);
              setIsCreating(false);
            },
            onError: (error) => {
              console.error("Failed to create sample:", error);
              setIsCreating(false);
            },
          },
        );
      } catch (error) {
        console.error("Failed to create sample:", error);
        setIsCreating(false);
      }
    } else {
      const sample = allSamples.find((s) => s.name === selectedValue);
      onValueChange(sample || null);
    }
    setOpen(false);
    setSearchValue("");
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  }

  async function handleCreateFirstSample() {
    if (!firstSampleName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      create(
        { name: firstSampleName.trim() },
        {
          onSuccess: (newSample) => {
            onValueChange(newSample);
            setFirstSampleName("");
            setIsCreating(false);
          },
          onError: (error) => {
            console.error("Failed to create first sample:", error);
            setIsCreating(false);
          },
        },
      );
    } catch (error) {
      console.error("Failed to create first sample:", error);
      setIsCreating(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCreateFirstSample();
    }
  }

  // If no samples exist in the database, show the first sample creation UI.
  if (totalItems === 0) {
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
            placeholder="Type to search samples..."
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
