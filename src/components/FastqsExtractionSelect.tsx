import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsetButton } from "@/components/ui/unset";
import type { FastqExtraction } from "@/types";
import { FastqExtractions } from "@/types";

type ExtractionSelectProps = {
  className?: string;
  disabled?: boolean;
  onSelect: (value: FastqExtraction | null) => void;
  placeholder?: string;
  value: FastqExtraction | null;
};

export function FastqsExtractionSelect({
  className = "",
  disabled = false,
  onSelect,
  placeholder = "Select extraction...",
  value,
}: ExtractionSelectProps) {
  function handleValueChange(newValue: string) {
    if (FastqExtractions.includes(newValue)) {
      onSelect(newValue as FastqExtraction);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value || ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={className || "w-[180px]"}>
          <SelectValue placeholder={placeholder || "Select extraction"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="presto">Presto</SelectItem>
          <SelectItem value="kingfisher">Kingfisher</SelectItem>
          <SelectItem value="external">External</SelectItem>
        </SelectContent>
      </Select>
      <UnsetButton onUnset={() => onSelect(null)} disabled={disabled} />
    </div>
  );
}
