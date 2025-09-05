import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsetButton } from "@/components/ui/unset";
import type { FastqType } from "@/types";
import { FastqTypes } from "@/types";

type TypeSelectProps = {
  className?: string;
  disabled?: boolean;
  onSelect: (value: FastqType | null) => void;
  placeholder?: string;
  value: FastqType | null;
};

export function FastqsTypeSelect({
  className = "",
  disabled = false,
  onSelect,
  placeholder = "Select type...",
  value,
}: TypeSelectProps) {
  function handleValueChange(newValue: string) {
    if (FastqTypes.includes(newValue)) {
      onSelect(newValue as FastqType);
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
          <SelectValue placeholder={placeholder || "Select type"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dsRNA">dsRNA</SelectItem>
          <SelectItem value="smRNA">smRNA</SelectItem>
          <SelectItem value="ribominus">Ribominus</SelectItem>
          <SelectItem value="totRNA">totRNA</SelectItem>
        </SelectContent>
      </Select>
      <UnsetButton onUnset={() => onSelect(null)} disabled={disabled} />
    </div>
  );
}
