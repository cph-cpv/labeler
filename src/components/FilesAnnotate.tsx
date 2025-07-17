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
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface AnnotateProps {
  selectedCount: number;
}

export function FilesAnnotate({ selectedCount }: AnnotateProps) {
  const [open, setOpen] = useState(false);

  useHotkeys("a", () => {
    setOpen(true);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Annotate <Kbd shortcut="A" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annotate Files</DialogTitle>
          <DialogDescription>
            Annotate {selectedCount} selected{" "}
            {selectedCount === 1 ? "file" : "files"}.
          </DialogDescription>
        </DialogHeader>
        {/* TODO: Add annotation form content here */}
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Annotation form will go here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
