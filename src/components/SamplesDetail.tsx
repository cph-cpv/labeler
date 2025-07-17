import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { Sample } from "@/types.ts";
import { useState } from "react";

interface SamplesDetailProps {
  sample: Sample;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SamplesDetail({
  sample,
  open,
  onOpenChange,
}: SamplesDetailProps) {
  const [name, setName] = useState(sample.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Sample Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3 prose">
            <div>
              <Label htmlFor="sample-name">Name</Label>
              <div className="mt-2">
                <Input
                  id="sample-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter sample name"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
