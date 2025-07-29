import { FastqsQualityDot } from "@/components/FastqsQualityDot";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsetButton } from "@/components/ui/unset";

import { type FastqQuality, QUALITIES } from "@/lib/quality.ts";

type FastqsQualitySelectProps = {
  value: FastqQuality | null;
  onValueChange: (value: FastqQuality | null) => void;
  disabled?: boolean;
  id?: string;
};

export function FastqsQualitySelect({
  value,
  onValueChange,
  disabled = false,
  id,
}: FastqsQualitySelectProps) {
  function handleSelectChange(value: string) {
    if (["1", "2", "3", "4", "5"].includes(value)) {
      onValueChange(value as FastqQuality);
    } else {
      onValueChange(null);
    }
  }

  function handleUnset() {
    onValueChange(null);
  }

  return (
    <div>
      <Label htmlFor={id} className="font-semibold">
        Quality
      </Label>
      <div className="mt-2 flex gap-2">
        <Select
          disabled={disabled}
          onValueChange={handleSelectChange}
          value={value ? value.toString() : ""}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select quality rating" />
          </SelectTrigger>
          <SelectContent>
            {QUALITIES.map((quality) => (
              <SelectItem
                className="flex items-center gap-2"
                key={quality}
                value={quality}
              >
                <FastqsQualityDot quality={quality} /> {quality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <UnsetButton onUnset={handleUnset} disabled={disabled} />
      </div>
    </div>
  );
}
