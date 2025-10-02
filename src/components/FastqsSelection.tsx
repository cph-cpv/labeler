import { FastqsDilutionMulti } from "@/components/FastqsDilutionMulti.tsx";
import { FastqsExcludeMultiple } from "@/components/FastqsExcludeMultiple.tsx";
import { FastqsExtractionMulti } from "@/components/FastqsExtractionMulti.tsx";
import { FastqsInclude } from "@/components/FastqsInclude.tsx";
import { FastqsQualityMulti } from "@/components/FastqsQualityMulti.tsx";
import { FastqsLibraryPrepMulti } from "@/components/FastqsLibraryPrepMulti.tsx";
import { FastqsSampleMulti } from "@/components/FastqsSampleMulti.tsx";
import { FastqsTypeMulti } from "@/components/FastqsTypeMulti.tsx";
import { SelectionBar } from "@/components/ui/selection-bar.tsx";

type FastqsSelectionProps = {
  category: string;
};

export function FastqsSelection({ category }: FastqsSelectionProps) {
  return (
    <SelectionBar itemName="FASTQ">
      {category === "excluded" ? (
        <FastqsInclude />
      ) : (
        <>
          <FastqsTypeMulti />
          <FastqsExtractionMulti />
          <FastqsQualityMulti />
          <FastqsDilutionMulti />
          <FastqsLibraryPrepMulti />
          <FastqsSampleMulti />
          <FastqsExcludeMultiple />
        </>
      )}
    </SelectionBar>
  );
}
