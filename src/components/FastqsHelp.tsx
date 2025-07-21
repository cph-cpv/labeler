import { Button } from "@/components/ui/button.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  CheckCircle,
  Fingerprint,
  HelpCircle,
  TestTube,
  X,
} from "lucide-react";

export function FastqsHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help about file categories</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h2 className="font-semibold">FASTQs View</h2>
          <div>
            <p className="text-sm text-muted-foreground">
              Allows you to set annotations and sample assignments on FASTQ
              FASTQs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">File Categories</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Fingerprint className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Unannotated</div>
                  <div className="text-muted-foreground">
                    FASTQs missing type, quality, or dilution factor
                    information.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <TestTube className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Unassigned</div>
                  <div className="text-muted-foreground">
                    FASTQs not yet assigned to a sample.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <X className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Excluded</div>
                  <div className="text-muted-foreground">
                    FASTQs that have been excluded from processing.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium">Done</div>
                  <div className="text-muted-foreground">
                    FASTQs that are fully annotated and assigned to samples.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
