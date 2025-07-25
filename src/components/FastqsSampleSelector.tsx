import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  usePocketBaseFirst,
  usePocketBasePaginated,
} from "@/hooks/usePocketBaseQuery.ts";
import { useSampleCreation } from "@/hooks/useSampleCreation";
import { cn, guessCommonSampleName } from "@/lib/utils.ts";
import type { Sample } from "@/types.ts";
import { AlertCircle, Check, CircleCheck, Plus } from "lucide-react";
import * as React from "react";

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
  const [searchValue, setSearchValue] = React.useState("");
  const [firstSampleName, setFirstSampleName] = React.useState(() => {
    const guessed = guessCommonSampleName(fastqNames);
    return guessed || "";
  });

  const guessedSampleName = guessCommonSampleName(fastqNames);
  const canGuessName = guessedSampleName !== undefined;

  // Try to find exact match for guessed name using PocketBase query
  const { data: exactMatch } = usePocketBaseFirst<Sample>(
    "samples",
    guessedSampleName ? `name = "${guessedSampleName}"` : null,
  );

  // Use paginated query for better performance - fetch 50 samples (app default)
  const { data: allSamples = [], totalItems = 0 } =
    usePocketBasePaginated<Sample>("samples", {
      sort: "name", // Sort alphabetically for better UX
    });

  const { createSample, isCreating } = useSampleCreation(onChange);

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

  const showCreateOption = Boolean(
    searchValue &&
      searchValue.trim() &&
      !searchExactMatch &&
      filteredSamples.length === 0,
  );

  function handleSampleSelect(sample: Sample) {
    onChange(sample.id);
  }

  async function handleCreateSample() {
    await createSample(searchValue);
    setSearchValue("");
  }

  async function handleCreateGuessedSample(name: string) {
    await createSample(name);
  }

  async function handleCreateFirstSample() {
    await createSample(firstSampleName);
    setFirstSampleName("");
  }

  // If no samples exist in the database, show the first sample creation UI.
  if (totalItems === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          No samples exist yet. Create your first sample to get started.
        </div>
        {!canGuessName && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Unable to guess sample name.</AlertTitle>
            <AlertDescription>
              Carefully check the FASTQ file names and create a sample name
              manually if necessary.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Search samples..."
            value={firstSampleName}
            onChange={(e) => setFirstSampleName(e.target.value)}
            disabled={isCreating}
            className="flex-1"
          />
          <Button
            onClick={handleCreateFirstSample}
            disabled={!firstSampleName.trim() || isCreating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    );
  }

  // Normal listbox when samples exist
  return (
    <div className="space-y-2">
      {canGuessName && !exactMatch && (
        <div className="text-sm text-muted-foreground">
          Guessed sample name:{" "}
          <span className="font-medium">{guessedSampleName}</span>
        </div>
      )}

      <div className="space-y-2">
        <Input
          placeholder="Type to search samples..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <ScrollArea className="border w-full rounded-md h-48">
          <div
            role="listbox"
            aria-label="Available samples"
            className="outline-none"
          >
            {exactMatch && (
              <div
                key={exactMatch.id}
                role="option"
                aria-selected={value === exactMatch.id}
                className={cn(
                  "p-2 px-4 text-sm border-b cursor-pointer hover:bg-muted/50 flex items-center justify-between",
                  value === exactMatch.id ? "bg-muted/50" : "bg-green-50",
                )}
                onClick={() => handleSampleSelect(exactMatch)}
              >
                <div className="flex items-center">{exactMatch.name}</div>
                {value !== exactMatch.id && (
                  <div className="flex gap-2 text-sm text-green-600 font-medium items-center">
                    <CircleCheck size={16} />
                    <span>Found existing</span>
                  </div>
                )}
              </div>
            )}

            {canGuessName && !exactMatch && (
              <div
                role="option"
                className="p-2 px-4 text-sm border-b cursor-pointer bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center justify-between"
                onClick={() => {
                  if (guessedSampleName) {
                    handleCreateGuessedSample(guessedSampleName);
                  }
                }}
              >
                <div className="flex items-center">{guessedSampleName}</div>
                <div className="flex gap-2 text-sm text-blue-600 font-medium items-center">
                  <Plus size={16} />
                  <span>Create new</span>
                </div>
              </div>
            )}

            {filteredSamples
              .filter((sample) => sample.id !== exactMatch?.id)
              .map((sample) => (
                <div
                  key={sample.id}
                  role="option"
                  aria-selected={value === sample.id}
                  className="p-2 px-4 text-sm border-b last:border-b-0 cursor-pointer hover:bg-muted/50 flex items-center"
                  onClick={() => handleSampleSelect(sample)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sample.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {sample.name}
                </div>
              ))}

            {showCreateOption && (
              <div
                role="option"
                className="p-2 text-sm cursor-pointer bg-green-50 text-green-800 hover:bg-green-100 mx-2 my-1 rounded-md border-t border-green-200 flex items-center"
                onClick={handleCreateSample}
              >
                <Plus className="mr-2 h-4 w-4 text-green-600" />
                {isCreating
                  ? `Creating "${searchValue}"...`
                  : `Create new sample "${searchValue}"`}
              </div>
            )}

            {filteredSamples.length === 0 && !showCreateOption && (
              <div
                className="p-2 text-sm text-muted-foreground text-center"
                role="status"
              >
                No samples found.
              </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
}
