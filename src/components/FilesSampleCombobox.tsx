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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import samplesData from "@/fake/samples.json";
import type { Sample } from "@/types.ts";
import { cn } from "@/utils.ts";

interface FilesSampleComboboxProps {
  value?: Sample | null;
  onValueChange: (sample: Sample | null) => void;
  placeholder?: string;
}

export function FilesSampleCombobox({
  value,
  onValueChange,
  placeholder = "Select sample...",
}: FilesSampleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const samples: Sample[] = samplesData;

  const filteredSamples = React.useMemo(() => {
    if (!searchValue) return samples;
    return samples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [samples, searchValue]);

  const exactMatch = samples.find(
    (sample) => sample.name.toLowerCase() === searchValue.toLowerCase(),
  );

  const showCreateOption =
    searchValue && !exactMatch && filteredSamples.length === 0;

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === "create-new") {
      // Create new sample with the search value
      const newSample: Sample = {
        id: Math.max(...samples.map((s) => s.id)) + 1, // Simple ID generation
        name: searchValue,
      };
      onValueChange(newSample);
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
      <PopoverContent className="w-[--radix-popper-anchor-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search samples..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? (
                <div className="py-2">
                  <CommandItem
                    value="create-new"
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </CommandItem>
                </div>
              ) : (
                "No samples found."
              )}
            </CommandEmpty>
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
            {showCreateOption && filteredSamples.length > 0 && (
              <CommandGroup>
                <CommandItem
                  value="create-new"
                  onSelect={handleSelect}
                  className="cursor-pointer border-t"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{searchValue}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
