import { Button } from "@/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { usePocketBaseCollection } from "@/hooks/usePocketBaseQuery.ts";
import { useSelection } from "@/hooks/useSelection.tsx";
import { pb } from "@/lib/pocketbase.ts";
import { cn } from "@/lib/utils.ts";
import type { Fastq, Virus } from "@/types.ts";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type AnnotationType = "missing" | "contamination";

type AnnotateProps = {
  onAnnotationComplete?: () => void;
};

const annotationTypes: { value: AnnotationType; label: string }[] = [
  { value: "missing", label: "Missing" },
  { value: "contamination", label: "Contamination" },
];

export function FastqsAnnotate({ onAnnotationComplete }: AnnotateProps) {
  const { selectedItems: selectedFastqs, onClearSelection } =
    useSelection<Fastq>();
  const [selectedVirus, setSelectedVirus] = useState<Virus | null>(null);
  const [selectedAnnotationType, setSelectedAnnotationType] =
    useState<AnnotationType | null>(null);
  const [open, setOpen] = useState(false);
  const [virusPopoverOpen, setVirusPopoverOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isAnnotating, setIsAnnotating] = useState(false);

  const { data: viruses = [] } = usePocketBaseCollection<Virus>("viruses");

  useHotkeys(
    "a",
    () => {
      setOpen(true);
    },
    {
      enableOnFormTags: true,
      enabled: selectedFastqs.length > 0,
    },
  );

  const filteredViruses = viruses.filter(
    (virus) =>
      virus.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      virus.acronym?.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleAnnotate = async () => {
    if (
      !selectedVirus ||
      !selectedAnnotationType ||
      selectedFastqs.length === 0
    ) {
      return;
    }

    setIsAnnotating(true);
    try {
      // Create annotation records and update FASTQs.
      await Promise.all(
        selectedFastqs.map(async (file) => {
          const annotation = await pb.collection("annotations").create({
            type: selectedAnnotationType,
            viruses: selectedVirus.id,
          });

          // Update file with annotation
          await pb.collection("fastqs").update(file.id, {
            annotations: annotation.id,
          });
        }),
      );

      // Clear selection and close dialog
      onClearSelection();
      setOpen(false);
      setSelectedVirus(null);
      setSelectedAnnotationType(null);
      setSearchValue("");

      // Notify parent component if callback provided
      if (onAnnotationComplete) {
        onAnnotationComplete();
      }
    } catch (error) {
      console.error("Failed to annotate FASTQs:", error);
    } finally {
      setIsAnnotating(false);
    }
  };

  const handleVirusSelect = (virus: Virus) => {
    setSelectedVirus(virus);
    setVirusPopoverOpen(false);
    setSearchValue("");
  };

  const handleTypeSelect = (type: AnnotationType) => {
    setSelectedAnnotationType(type);
    setTypePopoverOpen(false);
  };

  const selectedTypeData = annotationTypes.find(
    (t) => t.value === selectedAnnotationType,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Annotate <Kbd shortcut="A" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annotate FASTQs</DialogTitle>
          <DialogDescription>
            Annotate {selectedFastqs.length} selected{" "}
            {selectedFastqs.length === 1 ? "FASTQ" : "FASTQs"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Virus</label>
            <Popover open={virusPopoverOpen} onOpenChange={setVirusPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={virusPopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedVirus ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedVirus.name}</span>
                      {selectedVirus.acronym && (
                        <span className="text-muted-foreground">
                          ({selectedVirus.acronym})
                        </span>
                      )}
                    </div>
                  ) : (
                    "Select virus..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popper-anchor-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search viruses..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    {filteredViruses.length === 0 && (
                      <CommandEmpty>No viruses found.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {filteredViruses.map((virus) => (
                        <CommandItem
                          key={virus.id}
                          value={virus.name}
                          onSelect={() => handleVirusSelect(virus)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedVirus?.id === virus.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <span>{virus.name}</span>
                            {virus.acronym && (
                              <span className="text-muted-foreground">
                                ({virus.acronym})
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Annotation Type</label>
            <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={typePopoverOpen}
                  className="w-full justify-between"
                >
                  {selectedTypeData ? selectedTypeData.label : "Select type..."}
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
                      {annotationTypes.map((type) => (
                        <CommandItem
                          key={type.value}
                          value={type.value}
                          onSelect={() => handleTypeSelect(type.value)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedAnnotationType === type.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {type.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAnnotate}
            disabled={!selectedVirus || !selectedAnnotationType || isAnnotating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnnotating ? "Annotating..." : "Annotate FASTQs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
