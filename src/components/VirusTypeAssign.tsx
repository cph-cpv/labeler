import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import type { VirusType } from "@/types.ts";
import {
  Check,
  ChevronsUpDown,
  Circle,
  Hexagon,
  SatelliteIcon,
} from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface VirusTypeAssignProps {
  selectedCount: number;
}

const virusTypes: { value: VirusType; label: string; icon: typeof Hexagon }[] =
  [
    { value: "VIRUS", label: "Virus", icon: Hexagon },
    { value: "SATELLITE", label: "Satellite", icon: SatelliteIcon },
    { value: "VIROID", label: "Viroid", icon: Circle },
  ];

export function VirusTypeAssign({ selectedCount }: VirusTypeAssignProps) {
  const [selectedType, setSelectedType] = useState<VirusType | null>(null);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useHotkeys("t", () => {
    setDialogOpen(true);
  });

  const handleTypeSelect = (type: VirusType) => {
    setSelectedType(type);
    setOpen(false);
  };

  const handleAssign = () => {
    if (selectedType) {
      // TODO: Implement actual virus type assignment logic
      console.log(`Assigning ${selectedType} to ${selectedCount} viruses`);
      setDialogOpen(false);
      setSelectedType(null);
    }
  };

  const selectedTypeData = virusTypes.find((t) => t.value === selectedType);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Type <Kbd shortcut="T" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Virus Type</DialogTitle>
          <DialogDescription>
            Set the type for {selectedCount} selected{" "}
            {selectedCount === 1 ? "virus" : "viruses"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Virus Type</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedTypeData ? (
                    <div className="flex items-center gap-2">
                      <selectedTypeData.icon className="h-4 w-4" />
                      {selectedTypeData.label}
                    </div>
                  ) : (
                    "Select type..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popper-anchor-width] p-0"
                align="start"
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {virusTypes.map((type) => (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={() => handleTypeSelect(type.value)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedType === type.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <type.icon className="mr-2 h-4 w-4" />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedType}>
              Assign Type
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
