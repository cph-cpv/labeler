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
import { cn } from "@/lib/utils";
import type { Virus } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useViruses } from "@/hooks/useViruses";

type ExceptionsVirusSelectorProps = {
  sampleViruses: Virus[];
  type: "Contamination" | "Missing";
  value: string;
  onChange: (value: string) => void;
};

export function ExceptionsVirusSelector({
  sampleViruses,
  type,
  value,
  onChange,
}: ExceptionsVirusSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const { viruses: allViruses } = useViruses({ search: searchValue });

  const viruses = React.useMemo(() => {
    if (type === "Missing") {
      if (!searchValue) {
        return sampleViruses;
      }
      return sampleViruses.filter((virus) =>
        virus.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    } else {
      const sampleVirusIds = new Set(sampleViruses.map((v) => v.id));
      return allViruses.filter((virus) => !sampleVirusIds.has(virus.id));
    }
  }, [allViruses, sampleViruses, type, searchValue]);
  console.log(sampleViruses)
  const nameToId = new Map(viruses.map((v) => [v.name, v.id]));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? viruses.find((virus) => virus.id === value)?.name
            : "Select Virus"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" avoidCollisions={false} align="center" side="bottom">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search virus..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList style={{ maxHeight: "calc(var(--radix-popover-content-available-height) - 3rem)" }}>
            <CommandEmpty>No virus found.</CommandEmpty>
            <CommandGroup key={viruses.length}>
              {viruses.map((virus) => (
                <CommandItem
                  key={virus.id}
                  value={virus.name}
                  onSelect={(currentValue) => {
                    const id = nameToId.get(currentValue);
                    if (id) {
                        onChange(id === value ? "" : id);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === virus.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {virus.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
