import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { FilesTypeBadge } from "@/components/FilesTypeBadge.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import type { Fastq, Sample } from "@/types.ts";
import data from "@/fake/fastq.json";
import samplesData from "@/fake/samples.json";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/files/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const fastq = data.find((f: Fastq) => f.id === parseInt(id));
  const [quality, setQuality] = useState<number[]>([fastq?.quality || 1]);
  const [dilutionFactor, setDilutionFactor] = useState<number[]>([fastq?.dilutionFactor || 1]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [sampleSearch, setSampleSearch] = useState<string>("");

  const samples: Sample[] = samplesData;

  const filteredSamples = useMemo(() => {
    if (!sampleSearch) return samples;
    return samples.filter(sample => 
      sample.name.toLowerCase().includes(sampleSearch.toLowerCase())
    );
  }, [samples, sampleSearch]);

  if (!fastq) {
    return <Navigate to="/files" />;
  }

  const handleClose = () => {
    navigate({ to: "/files" });
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fastq.name}</DialogTitle>
          <DialogDescription>FASTQ File Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Non-editable fields */}
          <div className="space-y-3 prose">
            <div>
              <strong>Path:</strong> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{fastq.path}</span>
            </div>
            <div>
              <strong>Run Date:</strong> {new Date(fastq.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Annotations</h3>
            <div className="space-y-3 prose">
            <div>
              <strong>Type:</strong> <FilesTypeBadge type={fastq.type} />
            </div>
            <div>
              <strong>Quality:</strong> 
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-medium">{quality[0]}</span>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">5</span>
              </div>
            </div>
            <div>
              <strong>Dilution Factor:</strong>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-medium">{dilutionFactor[0]}</span>
                <Slider
                  value={dilutionFactor}
                  onValueChange={(value) => setDilutionFactor([value[0] === 0 ? 1 : value[0]])}
                  min={0}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">100</span>
              </div>
            </div>
              <div>
                <strong>Excluded:</strong> {fastq.excluded ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* Sample section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Sample</h3>
            <div className="space-y-3">
              <div>
                <Input
                  placeholder="Search samples..."
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                />
              </div>
              {selectedSample && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedSample.name}</span>
                    <button
                      onClick={() => setSelectedSample(null)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {!selectedSample && (
                <ScrollArea className="h-64 border border-gray-200 rounded-md">
                  {filteredSamples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => setSelectedSample(sample)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      {sample.name}
                    </button>
                  ))}
                </ScrollArea>
              )}
              {!selectedSample && sampleSearch && filteredSamples.length === 0 && (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  No samples found matching "{sampleSearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}