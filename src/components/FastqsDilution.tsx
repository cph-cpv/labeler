import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { UnsetButton } from "@/components/ui/unset.tsx";
import {
  DILUTIONS,
  formatDilution,
  parseDilution,
  type FastqDilution,
} from "@/lib/dilution.ts";

type DilutionProps = {
  value?: FastqDilution | null;
  onValueChange: (value: FastqDilution | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

export function FastqsDilution({
  value,
  onValueChange,
  placeholder = "Select dilution...",
  label,
  disabled = false,
}: DilutionProps) {
  return (
    <div>
      {label && <Label className="font-semibold">{label}</Label>}
      <div className="mt-3 flex items-center gap-2">
        <Select
          value={value || ""}
          onValueChange={(stringValue) => {
            if (stringValue === "") {
              onValueChange(null);
            } else {
              const dilutionValue = parseDilution(stringValue);
              onValueChange(dilutionValue);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {DILUTIONS.map((dilution) => (
              <SelectItem key={dilution} value={dilution.toString()}>
                {formatDilution(dilution)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <UnsetButton onUnset={() => onValueChange(null)} disabled={disabled} />
      </div>
    </div>
  );
}
