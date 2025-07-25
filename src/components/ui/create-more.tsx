import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";

type CreateMoreProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
};

export function CreateMore({
  checked,
  onCheckedChange,
  label = "Create more",
  id,
}: CreateMoreProps) {
  const switchId = id || "create-more-switch";

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={switchId} className="text-sm font-medium">
        {label}
      </Label>
    </div>
  );
}
