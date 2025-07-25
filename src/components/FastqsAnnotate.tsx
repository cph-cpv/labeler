import { FastqsAnnotateDilution } from "@/components/FastqsAnnotateDilution.tsx";
import { FastqsAnnotateQuality } from "@/components/FastqsAnnotateQuality.tsx";
import { FastqsAnnotateSample } from "@/components/FastqsAnnotateSample.tsx";
import { FastqsAnnotateType } from "@/components/FastqsAnnotateType.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Kbd } from "@/components/ui/kbd.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsAnnotate() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("type");
  const { selectedItems } = useSelection<Fastq>();

  useHotkeys(
    "a",
    () => {
      if (selectedItems.length > 0) {
        setOpen(true);
      }
    },
    {
      enabled: selectedItems.length > 0,
      preventDefault: true,
    },
  );

  useHotkeys("1", () => setActiveTab("type"), {
    enabled: open,
    preventDefault: true,
  });

  useHotkeys("2", () => setActiveTab("quality"), {
    enabled: open,
    preventDefault: true,
  });

  useHotkeys("3", () => setActiveTab("dilution"), {
    enabled: open,
    preventDefault: true,
  });

  useHotkeys("4", () => setActiveTab("sample"), {
    enabled: open,
    preventDefault: true,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          Annotate <Kbd shortcut="A" variant="subtle" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Annotate FASTQs</DialogTitle>
          <DialogDescription>
            Annotate the metadata and sample assignment of the selected FASTQ
            files.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="min-h-[500px]"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="type">
              Type <Kbd shortcut="1" variant="subtle" />
            </TabsTrigger>
            <TabsTrigger value="quality">
              Quality <Kbd shortcut="2" variant="subtle" />
            </TabsTrigger>
            <TabsTrigger value="dilution">
              Dilution <Kbd shortcut="3" variant="subtle" />
            </TabsTrigger>
            <TabsTrigger value="sample">
              Sample <Kbd shortcut="4" variant="subtle" />
            </TabsTrigger>
          </TabsList>

          <Separator />

          <FastqsAnnotateType selectedItems={selectedItems} />
          <FastqsAnnotateQuality selectedItems={selectedItems} />
          <FastqsAnnotateDilution selectedItems={selectedItems} />
          <FastqsAnnotateSample selectedItems={selectedItems} />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
