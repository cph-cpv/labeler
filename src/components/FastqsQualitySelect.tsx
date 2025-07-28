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

type FastqsQualitySelectProps = {
  value: number | null;
  onValueChange: (value: number | null) => void;
  disabled?: boolean;
  id?: string;
};

export function FastqsQualitySelect({
  value,
  onValueChange,
  disabled = false,
  id,
}: FastqsQualitySelectProps) {
  function handleSelectChange(stringValue: string) {
    if (stringValue === "") {
      onValueChange(null);
    } else {
      onValueChange(parseInt(stringValue));
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
            <SelectItem className="flex items-center gap-2" value="1">
              <FastqsQualityDot quality="1" /> 1
            </SelectItem>
            <SelectItem className="flex items-center gap-2" value="2">
              <FastqsQualityDot quality="2" /> 2
            </SelectItem>
            <SelectItem className="flex items-center gap-2" value="3">
              <FastqsQualityDot quality="3" /> 3
            </SelectItem>
            <SelectItem className="flex items-center gap-2" value="4">
              <FastqsQualityDot quality="4" /> 4
            </SelectItem>
            <SelectItem className="flex items-center gap-2" value="5">
              <FastqsQualityDot quality="5" /> 5
            </SelectItem>
          </SelectContent>
        </Select>
        <UnsetButton onUnset={handleUnset} disabled={disabled} />
      </div>
    </div>
  );
}
