import { Input } from "@/components/ui/input.tsx";
import {
  TwoPaneRemovableScrollArea,
  TwoPanes,
  TwoPaneScrollArea,
} from "@/components/ui/two-panes.tsx";
import { VirusType } from "@/components/VirusType.tsx";
import { useViruses } from "@/hooks/useViruses.ts";
import type { Virus } from "@/types.ts";
import { useState } from "react";

type SamplesLabelerProps = {
  selectedViruses: Virus[];
  onVirusSelect: (virus: Virus) => void;
  onVirusRemove: (virus: Virus) => void;
  onVirusesChange?: (viruses: Virus[]) => void;
};

export function SamplesLabeler({
  selectedViruses,
  onVirusSelect,
  onVirusRemove,
}: SamplesLabelerProps) {
  const [searchValue, setSearchValue] = useState("");

  const { viruses, isLoading, error } = useViruses({
    search: searchValue,
  });

  // Filter out already selected viruses from available list
  const selectedVirusIds = new Set(selectedViruses.map((v) => v.id));
  const availableViruses = viruses.filter(
    (virus) => !selectedVirusIds.has(virus.id),
  );

  function renderVirusItem(virus: Virus) {
    return (
      <div>
        <div className="font-medium">{virus.name}</div>
        <div className="flex items-center text-sm text-gray-700 justify-between">
          <div>{virus.acronym || <em>No Acronym</em>}</div>
          <div>
            {virus.type ? <VirusType type={virus.type} /> : <em>Untyped</em>}
          </div>
        </div>
      </div>
    );
  }

  function renderSelectedVirusItem(virus: Virus) {
    return (
      <div>
        <div className="font-medium">{virus.name}</div>
        {virus.acronym && (
          <div className="text-sm text-gray-600">{virus.acronym}</div>
        )}
        {virus.type && (
          <div className="text-xs text-gray-500">{virus.type}</div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading viruses: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search viruses by name or acronym..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <TwoPanes
        leftTitle="Available Viruses"
        rightTitle="Selected Viruses"
        leftCount={availableViruses.length}
        rightCount={selectedViruses.length}
        isLoading={isLoading}
        leftContent={
          <TwoPaneScrollArea
            items={availableViruses}
            onItemClick={onVirusSelect}
            emptyStateText={
              searchValue
                ? "No available viruses found"
                : "No available viruses"
            }
            renderItem={renderVirusItem}
            getItemId={(virus) => `available-virus-${virus.id}`}
            ariaLabel="Available viruses for selection"
          />
        }
        rightContent={
          <TwoPaneRemovableScrollArea
            items={selectedViruses}
            onItemRemove={onVirusRemove}
            emptyStateText="No viruses selected"
            renderItem={renderSelectedVirusItem}
            getItemId={(virus) => `selected-virus-${virus.id}`}
            ariaLabel="Selected viruses for association"
          />
        }
      />
    </div>
  );
}
