import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsetButton } from "@/components/ui/unset";
import type { FastqLibraryPrep } from "@/types";
import { FastqLibraryPreps } from "@/types";

type LibraryPrepSelectProps = {
  className?: string;
  disabled?: boolean;
  onSelect: (value: FastqLibraryPrep | null) => void;
  placeholder?: string;
  value: FastqLibraryPrep | null;
};

export function FastqsLibraryPrepSelect({
  className = "",
  disabled = false,
  onSelect,
  placeholder = "Select library prep...",
  value,
}: LibraryPrepSelectProps) {
  function handleValueChange(newValue: string) {
    if (FastqLibraryPreps.includes(newValue)) {
      onSelect(newValue as FastqLibraryPrep);
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
          <SelectValue placeholder={placeholder || "Select library prep"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="robotic">Robotic</SelectItem>
          <SelectItem value="external">External</SelectItem>
        </SelectContent>
      </Select>
      <UnsetButton onUnset={() => onSelect(null)} disabled={disabled} />
    </div>
  );
}
