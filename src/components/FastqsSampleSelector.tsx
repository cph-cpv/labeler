import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Listbox, ListboxOption } from "@/components/ui/listbox";
import {
  usePocketBaseFirst,
  usePocketBasePaginated,
} from "@/hooks/usePocketBaseQuery.ts";
import { useSampleCreation } from "@/hooks/useSampleCreation";
import { guessCommonSampleName } from "@/lib/utils.ts";
import type { Sample } from "@/types.ts";
import { AlertCircle, Clover, Plus } from "lucide-react";
import * as React from "react";

type SelectionValue =
  | { type: "sample"; id: string }
  | { type: "create"; name: string }
  | { type: "create-guessed"; name: string };

type FastqsSampleSelectorProps = {
  onChange: (sampleId: string | null) => void;
  placeholder?: string;
  value?: string | null;
  fastqNames: string[];
};

export function FastqsSampleSelector({
  fastqNames,
  onChange,
  value,
}: FastqsSampleSelectorProps) {
  const guessedSampleName = React.useMemo(
    () => guessCommonSampleName(fastqNames),
    [fastqNames],
  );
  const canGuessName = guessedSampleName !== undefined;

  const [searchValue, setSearchValue] = React.useState(
    () => guessedSampleName || "",
  );

  // Try to find exact match for guessed name using PocketBase query
  const { data: guessedMatch } = usePocketBaseFirst<Sample>(
    "samples",
    guessedSampleName ? `name = "${guessedSampleName}"` : "",
  );

  const { data: allSamples = [] } = usePocketBasePaginated<Sample>("samples", {
    sort: "name",
  });

  const { createSample } = useSampleCreation();

  // Find the currently selected sample
  const selectedSample = allSamples.find((sample) => sample.id === value);

  // Use the selected sample as exactMatch, or fall back to guessedMatch
  const exactMatch = selectedSample || guessedMatch;

  const filteredSamples = React.useMemo(() => {
    // Client-side filtering on the fetched subset
    if (!searchValue) {
      return allSamples;
    }
    return allSamples.filter((sample) =>
      sample.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [allSamples, searchValue]);

  const searchExactMatch = allSamples.find(
    (sample) => sample.name.toLowerCase() === searchValue.toLowerCase(),
  );

  async function handleSelect(value: SelectionValue) {
    if (value.type === "sample") {
      onChange(value.id);
    } else {
      const sample = await createSample(value.name);

      if (sample) {
        onChange(sample.id);
      }
    }
  }

  function handleClickGuessedName() {
    if (guessedSampleName) {
      setSearchValue(guessedSampleName);
    }
  }

  return (
    <div className="space-y-2">
      {canGuessName ? (
        <div className="text-sm text-muted-foreground">
          Guessed sample name:{" "}
          <button
            type="button"
            onClick={handleClickGuessedName}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline cursor-pointer"
          >
            {guessedSampleName}
          </button>
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Unable to guess sample name.</AlertTitle>
          <AlertDescription>
            Carefully check the FASTQ file names and create a sample name
            manually if necessary.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Input
          placeholder="Type to search samples..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Listbox
          placeholder="No samples found."
          aria-label="Available samples"
          onSelect={(value) => handleSelect(JSON.parse(value))}
          value={value}
        >
          {exactMatch && (
            <ListboxOption
              className={
                value !== exactMatch.id && exactMatch === guessedMatch
                  ? "bg-green-50"
                  : undefined
              }
              label={exactMatch.name}
              value={JSON.stringify({ type: "sample", id: exactMatch.id })}
            >
              <div className="flex items-center justify-between w-full">
                <span>{exactMatch.name}</span>
                {value !== exactMatch.id && exactMatch === guessedMatch && (
                  <div className="flex gap-2 text-sm text-green-600 font-medium items-center">
                    <Clover size={16} />
                    <span>Found existing</span>
                  </div>
                )}
              </div>
            </ListboxOption>
          )}

          {/* Add create new option based on search input or guessed name */}
          {((canGuessName && !guessedMatch && guessedSampleName) ||
            (searchValue && searchValue.trim() && !searchExactMatch)) && (
            <ListboxOption
              className="bg-blue-50 text-blue-800 hover:bg-blue-100"
              label={searchValue || guessedSampleName || ""}
              value={JSON.stringify({
                type: "create",
                name: searchValue.trim() || guessedSampleName || "",
              })}
            >
              <div className="flex items-center justify-between w-full">
                <span>{searchValue || guessedSampleName}</span>
                <div className="flex gap-2 text-sm text-blue-600 font-medium items-center">
                  <Plus size={16} />
                  <span>Create new</span>
                </div>
              </div>
            </ListboxOption>
          )}

          {/* Add filtered samples */}
          {filteredSamples
            .filter((sample) => sample.id !== exactMatch?.id)
            .map((sample) => (
              <ListboxOption
                key={sample.id}
                label={sample.name}
                value={JSON.stringify({ type: "sample", id: sample.id })}
              >
                {sample.name}
              </ListboxOption>
            ))}
        </Listbox>
      </div>
    </div>
  );
}
