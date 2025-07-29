import { FastqsHelp } from "@/components/FastqsHelp.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import type { FastqsCategory } from "@/types.ts";
import { CheckCircle, ClipboardList, X } from "lucide-react";

type FastqsTabsProps = {
  category: FastqsCategory;
  isLoading: boolean;
  setCategory: (category: string) => void;
};

export function FastqsTabs({
  category,
  isLoading,
  setCategory,
}: FastqsTabsProps) {
  return (
    <>
      <Tabs value={category} onValueChange={setCategory} className="flex-1">
        <TabsList>
          <TabsTrigger value="todo">
            <ClipboardList className="w-4 h-4" />
            Todo
          </TabsTrigger>
          <TabsTrigger value="excluded">
            <X className="w-4 h-4" />
            Excluded
          </TabsTrigger>
          <TabsTrigger value="done">
            <CheckCircle className="w-4 h-4" />
            Done
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <LoadingIndicator isLoading={isLoading} />
      <FastqsHelp />
    </>
  );
}
