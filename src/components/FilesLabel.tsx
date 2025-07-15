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

interface LabelProps {
  selectedCount: number;
}

export function FilesLabel({ selectedCount }: LabelProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Label <Kbd shortcut="L" variant="invert" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Label Files</DialogTitle>
          <DialogDescription>
            Label {selectedCount} selected{" "}
            {selectedCount === 1 ? "file" : "files"}.
          </DialogDescription>
        </DialogHeader>
        {/* TODO: Add label form content here */}
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Label form will go here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}