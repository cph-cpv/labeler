import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading
    </div>
  );
}
