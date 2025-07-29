import { FastqsHelp } from "@/components/FastqsHelp.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import type { FastqsCategory } from "@/types.ts";
import { CheckCircle, ClipboardList, type LucideIcon, X } from "lucide-react";

// 1. Define tab data as a constant with "as const" for strict type inference.
const FASTQS_TABS = [
  { value: "todo", label: "Todo", Icon: ClipboardList },
  { value: "excluded", label: "Excluded", Icon: X },
  { value: "done", label: "Done", Icon: CheckCircle },
] as const satisfies {
  value: FastqsCategory;
  label: string;
  Icon: LucideIcon;
}[];

type FastqsTabsProps = {
  category: FastqsCategory;
  isLoading: boolean;
  setCategory: (category: FastqsCategory) => void;
};

export function FastqsTabs({
  category,
  isLoading,
  setCategory,
}: FastqsTabsProps) {
  return (
    <>
      <Tabs
        value={category}
        // The `onValueChange` prop passes a string, but since the values
        // are derived from our typed constant, it's safe to cast.
        onValueChange={(value) => setCategory(value as FastqsCategory)}
        className="flex-1"
      >
        <TabsList>
          {/* 3. Map over the array to render triggers dynamically. */}
          {FASTQS_TABS.map(({ value, label, Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <LoadingIndicator isLoading={isLoading} />
      <FastqsHelp />
    </>
  );
}
