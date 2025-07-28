import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsetButton } from "@/components/ui/unset";
import type { FastqType } from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";

type TypeSelectProps = {
  value?: FastqType | null;
  onValueChange?: (value: FastqType) => void;
  onUnset?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function FastqsTypeSelect(props?: TypeSelectProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const isControlled = props !== undefined;
  const selectedType = isControlled
    ? props.value
    : (search.type?.[0] as FastqType | undefined);

  function handleValueChange(value: string) {
    const typedValue = value as FastqType;
    if (isControlled && props.onValueChange) {
      props.onValueChange(typedValue);
    } else {
      navigate({
        search: (prev) => ({
          ...prev,
          type: [typedValue],
        }),
      });
    }
  }

  function handleUnset() {
    if (isControlled && props.onUnset) {
      props.onUnset();
    } else {
      navigate({
        search: (prev) => ({
          ...prev,
          type: undefined,
        }),
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedType || ""}
        onValueChange={handleValueChange}
        disabled={props?.disabled}
      >
        <SelectTrigger className={props?.className || "w-[180px]"}>
          <SelectValue placeholder={props?.placeholder || "Select type"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dsRNA">dsRNA</SelectItem>
          <SelectItem value="smRNA">smRNA</SelectItem>
        </SelectContent>
      </Select>
      {selectedType && (
        <UnsetButton onUnset={handleUnset} disabled={props?.disabled} />
      )}
    </div>
  );
}
