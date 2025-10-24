import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  TwoPaneRemovableScrollArea,
  TwoPanes,
  TwoPaneScrollArea,
} from "@/components/ui/two-panes.tsx";
import { useVirusByAcronym } from "@/hooks/useVirusByAcronym.ts";
import { useViruses } from "@/hooks/useViruses.ts";
import type { Virus } from "@/types.ts";
import { Plus } from "lucide-react";
import { useState } from "react";

function AddPVEV1Button({
  selectedViruses,
  onVirusSelect,
}: {
  selectedViruses: Virus[];
  onVirusSelect: (virus: Virus) => void;
}) {
  const hasPVEV1 = selectedViruses.some((virus) => virus.acronym === "PvEV-1");

  if (hasPVEV1) {
    return null;
  }

  const { virus, isLoading } = useVirusByAcronym("PvEV-1");

  return (
    <Button
      variant="secondary"
      size="sm"
      className="flex-grow flex align-start"
      disabled={isLoading}
      onClick={() => {
        if (virus) onVirusSelect(virus);
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Add PvEV-1
    </Button>
  );
}

type SamplesLabelerProps = {
  onVirusSelect: (virus: Virus) => void;
  onVirusRemove: (virus: Virus) => void;
  onVirusesChange?: (viruses: Virus[]) => void;
  selectedViruses: Virus[];
};

export function SamplesLabeler({
  selectedViruses,
  onVirusSelect,
  onVirusRemove,
}: SamplesLabelerProps) {
  const [searchValue, setSearchValue] = useState("");

  const { viruses, isLoading, error, totalItems } = useViruses({
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
        leftCount={totalItems}
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
            bottomMessage={
              <AddPVEV1Button
                selectedViruses={selectedViruses}
                onVirusSelect={onVirusSelect}
              />
            }
          />
        }
      />
    </div>
  );
}
