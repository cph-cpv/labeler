import { FastqsSampleMulti } from "@/components/FastqsSampleMulti.tsx";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { useSelection } from "@/hooks/useSelection.tsx";
import type { Fastq } from "@/types.ts";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function FastqsAnnotate() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sample");
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
      enableOnFormTags: true,
    },
  );

  useHotkeys("1", () => setActiveTab("sample"), {
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
            <TabsTrigger value="sample">
              Sample <Kbd shortcut="1" variant="subtle" />
            </TabsTrigger>
          </TabsList>

          <Separator />

          <TabsContent value="sample">
            <FastqsSampleMulti selectedItems={selectedItems} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
