import { FastqsHelp } from "@/components/FastqsHelp.tsx";
import { LoadingIndicator } from "@/components/ui/loading-indicator.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useFastqs } from "@/hooks/useFastqs.ts";
import { CheckCircle, Fingerprint, TestTube, X } from "lucide-react";

export function FastqsTabs() {
  const { category, isLoading, setCategory } = useFastqs();

  return (
    <>
      <Tabs value={category} onValueChange={setCategory} className="flex-1">
        <TabsList>
          <TabsTrigger value="unannotated">
            <Fingerprint className="w-4 h-4" />
            Unannotated
          </TabsTrigger>
          <TabsTrigger value="unassigned">
            <TestTube className="w-4 h-4" />
            Unassigned
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

      {isLoading && <LoadingIndicator />}
      <FastqsHelp />
    </>
  );
}
